const Redis = require('ioredis');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Redis Client Setup
 * Uses REDIS_URL env var if available (e.g., from Upstash, Redis Cloud, etc.)
 * Falls back to local Redis, and gracefully degrades if Redis is unavailable
 */

let redis = null;
let isRedisAvailable = false;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
    redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            if (times > 3) {
                console.warn('[Redis] Max retries reached, giving up');
                return null; // Stop retrying
            }
            return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
        connectTimeout: 5000,
        tls: REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
    });

    redis.on('connect', () => {
        console.log('[Redis] Connected successfully');
        isRedisAvailable = true;
    });

    redis.on('error', (err) => {
        console.warn('[Redis] Connection error:', err.message);
        isRedisAvailable = false;
    });

    redis.on('close', () => {
        console.warn('[Redis] Connection closed');
        isRedisAvailable = false;
    });

    // Attempt connection
    redis.connect().catch((err) => {
        console.warn('[Redis] Initial connection failed:', err.message);
        console.warn('[Redis] Caching disabled - falling back to direct DB queries');
        isRedisAvailable = false;
    });
} else {
    console.log('[Redis] No REDIS_URL configured - caching disabled');
}

// Default TTLs (in seconds)
const TTL = {
    ALL_JOBS: 120,          // 2 minutes - job listings change less frequently
    JOB_DETAIL: 300,        // 5 minutes - individual job details
    EMPLOYER_PROFILE: 300,  // 5 minutes
    FILTERED_JOBS: 60,      // 1 minute - personalized, changes with user activity
    EMPLOYER_JOBS: 120,     // 2 minutes
    APPLICATIONS: 60,       // 1 minute - status changes frequently
    DASHBOARD_STATS: 30,    // 30 seconds - stats should be relatively fresh
    QUIZ_QUESTIONS: 3600,   // 1 hour - questions rarely change
    ASSESSMENT_RESULTS: 300 // 5 minutes
};

// Cache key prefixes
const KEYS = {
    ALL_JOBS: 'jobs:all',
    JOB_DETAIL: (id) => `jobs:${id}`,
    FILTERED_JOBS: (userId) => `jobs:filtered:${userId}`,
    EMPLOYER_JOBS: (employerId) => `jobs:employer:${employerId}`,
    EMPLOYER_PROFILE: (id) => `employer:${id}`,
    EMPLOYER_NAME: (id) => `employer:name:${id}`,
    JOBSEEKER_PROFILE: (id) => `jobseeker:${id}`,
    APPLICATIONS_USER: (userId) => `applications:user:${userId}`,
    APPLICATIONS_EMPLOYER: (employerId) => `applications:employer:${employerId}`,
    APPLICATIONS_JOB: (jobId) => `applications:job:${jobId}`,
    DASHBOARD: (userId) => `dashboard:${userId}`,
    QUIZ_QUESTIONS: 'quiz:questions',
    ASSESSMENT_RESULTS: (userId) => `assessment:${userId}`,
    MATCHED_JOBS: (userId) => `jobs:matched:${userId}`
};

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {any|null} Parsed data or null if not cached/unavailable
 */
const getCache = async (key) => {
    if (!isRedisAvailable || !redis) return null;
    try {
        const data = await redis.get(key);
        if (data) {
            console.log(`[Redis] Cache HIT: ${key}`);
            return JSON.parse(data);
        }
        console.log(`[Redis] Cache MISS: ${key}`);
        return null;
    } catch (err) {
        console.warn(`[Redis] Get error for key "${key}":`, err.message);
        return null;
    }
};

/**
 * Set cached data
 * @param {string} key - Cache key
 * @param {any} data - Data to cache (will be JSON.stringify'd)
 * @param {number} ttl - Time to live in seconds
 */
const setCache = async (key, data, ttl) => {
    if (!isRedisAvailable || !redis) return;
    try {
        await redis.setex(key, ttl, JSON.stringify(data));
        console.log(`[Redis] Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (err) {
        console.warn(`[Redis] Set error for key "${key}":`, err.message);
    }
};

/**
 * Delete cached data (for cache invalidation)
 * @param {string|string[]} keys - Key(s) to delete
 */
const delCache = async (keys) => {
    if (!isRedisAvailable || !redis) return;
    try {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        if (keyArray.length > 0) {
            await redis.del(...keyArray);
            console.log(`[Redis] Cache DEL: ${keyArray.join(', ')}`);
        }
    } catch (err) {
        console.warn(`[Redis] Delete error:`, err.message);
    }
};

/**
 * Delete cached data matching a pattern
 * @param {string} pattern - Key pattern (e.g., "jobs:*")
 */
const delCachePattern = async (pattern) => {
    if (!isRedisAvailable || !redis) return;
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`[Redis] Cache DEL pattern "${pattern}": ${keys.length} keys`);
        }
    } catch (err) {
        console.warn(`[Redis] Pattern delete error:`, err.message);
    }
};

/**
 * Invalidate all job-related caches
 * Called when a job is created, updated, or deleted
 */
const invalidateJobCaches = async () => {
    await delCachePattern('jobs:*');
    await delCachePattern('dashboard:*');
};

/**
 * Invalidate all application-related caches
 * Called when an application is created or status is updated
 */
const invalidateApplicationCaches = async (userId, employerId, jobId) => {
    const keys = [];
    if (userId) keys.push(KEYS.APPLICATIONS_USER(userId));
    if (employerId) keys.push(KEYS.APPLICATIONS_EMPLOYER(employerId));
    if (jobId) keys.push(KEYS.APPLICATIONS_JOB(jobId));
    keys.push(KEYS.DASHBOARD(userId));
    if (employerId) keys.push(KEYS.DASHBOARD(employerId));
    await delCache(keys);
};

/**
 * Invalidate employer-related caches
 */
const invalidateEmployerCaches = async (employerId) => {
    await delCache([
        KEYS.EMPLOYER_PROFILE(employerId),
        KEYS.EMPLOYER_NAME(employerId),
        KEYS.EMPLOYER_JOBS(employerId)
    ]);
    // Also invalidate all jobs since they include employer data
    await delCachePattern('jobs:all');
    await delCachePattern('jobs:filtered:*');
};

/**
 * Invalidate jobseeker-related caches
 */
const invalidateJobseekerCaches = async (userId) => {
    await delCache([
        KEYS.JOBSEEKER_PROFILE(userId),
        KEYS.DASHBOARD(userId),
        KEYS.FILTERED_JOBS(userId),
        KEYS.MATCHED_JOBS(userId),
        KEYS.ASSESSMENT_RESULTS(userId)
    ]);
};

module.exports = {
    redis,
    getCache,
    setCache,
    delCache,
    delCachePattern,
    invalidateJobCaches,
    invalidateApplicationCaches,
    invalidateEmployerCaches,
    invalidateJobseekerCaches,
    TTL,
    KEYS,
    isRedisAvailable: () => isRedisAvailable
};
