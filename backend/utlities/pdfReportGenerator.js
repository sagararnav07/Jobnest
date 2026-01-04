const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Personality to Job Role Mapping Algorithm
const personalityJobMapping = {
    'Openness': {
        idealRoles: ['UI/UX Designer', 'Product Manager', 'Creative Director', 'Research Scientist', 'Data Scientist', 'Machine Learning Engineer'],
        workStyle: 'Creative & Innovative',
        idealEnvironment: 'Startups, Research Labs, Creative Agencies',
        strengths: ['Creative problem-solving', 'Adaptability to change', 'Innovative thinking', 'Learning new technologies'],
        keywords: ['creative', 'design', 'research', 'innovation', 'strategy']
    },
    'Conscientiousness': {
        idealRoles: ['DevOps Engineer', 'QA Automation Engineer', 'Project Manager', 'Business Analyst', 'Security Engineer', 'Backend Developer'],
        workStyle: 'Organized & Detail-oriented',
        idealEnvironment: 'Enterprise Companies, Banks, Government',
        strengths: ['Attention to detail', 'Meeting deadlines', 'Quality assurance', 'Process optimization'],
        keywords: ['testing', 'automation', 'security', 'devops', 'analysis', 'backend']
    },
    'Extraversion': {
        idealRoles: ['Product Manager', 'Technical Lead', 'Sales Engineer', 'Scrum Master', 'Technical Writer', 'Full Stack Developer'],
        workStyle: 'Collaborative & Leadership',
        idealEnvironment: 'Team-based Projects, Client-facing Roles',
        strengths: ['Team collaboration', 'Client communication', 'Leadership', 'Presentation skills'],
        keywords: ['lead', 'manager', 'full stack', 'communication', 'team']
    },
    'Agreeableness': {
        idealRoles: ['Technical Support', 'HR Tech Specialist', 'Technical Writer', 'Customer Success Engineer', 'Junior Developer'],
        workStyle: 'Supportive & Team-oriented',
        idealEnvironment: 'Collaborative Teams, Non-profits, Education',
        strengths: ['Team harmony', 'Conflict resolution', 'Mentoring', 'Customer empathy'],
        keywords: ['support', 'writer', 'junior', 'mentor', 'customer']
    },
    'Neuroticism': {
        idealRoles: ['Security Engineer', 'QA Engineer', 'Risk Analyst', 'Compliance Officer'],
        workStyle: 'Risk-aware & Thorough',
        idealEnvironment: 'Structured environments with clear guidelines',
        strengths: ['Risk identification', 'Thorough testing', 'Attention to edge cases', 'Compliance awareness'],
        keywords: ['security', 'testing', 'risk', 'compliance', 'qa']
    }
};

// Calculate job match score based on personality
const calculateJobMatchScore = (job, categories) => {
    let score = 0;
    const jobTitleLower = job.jobTitle.toLowerCase();
    const jobDescLower = (job.description || '').toLowerCase();
    
    categories.forEach((cat, index) => {
        const mapping = personalityJobMapping[cat.categoryName];
        if (mapping) {
            // Weight by category rank (top trait gets more weight)
            const weight = (3 - index) / 3;
            
            // Check if job title matches ideal roles
            mapping.idealRoles.forEach(role => {
                if (jobTitleLower.includes(role.toLowerCase())) {
                    score += 30 * weight;
                }
            });
            
            // Check keywords in title and description
            mapping.keywords.forEach(keyword => {
                if (jobTitleLower.includes(keyword) || jobDescLower.includes(keyword)) {
                    score += 10 * weight;
                }
            });
            
            // Add base score from personality match
            score += (cat.score / 100) * 20 * weight;
        }
    });
    
    return Math.min(100, Math.round(score));
};

// Generate career recommendations based on personality
const generateCareerRecommendations = (categories) => {
    const recommendations = [];
    const topCategory = categories[0];
    const mapping = personalityJobMapping[topCategory?.categoryName];
    
    if (mapping) {
        recommendations.push({
            title: 'Ideal Work Environment',
            content: mapping.idealEnvironment
        });
        recommendations.push({
            title: 'Recommended Work Style',
            content: mapping.workStyle
        });
        recommendations.push({
            title: 'Key Strengths to Highlight',
            content: mapping.strengths.join(', ')
        });
    }
    
    // Add combination insights for top 2 traits
    if (categories.length >= 2) {
        const combo = `${categories[0].categoryName}-${categories[1].categoryName}`;
        const comboInsights = {
            'Openness-Conscientiousness': 'You combine creativity with discipline - ideal for innovative yet structured roles like Product Management or Data Science.',
            'Openness-Extraversion': 'Your creativity and social energy make you perfect for leadership roles in creative teams or startup environments.',
            'Conscientiousness-Extraversion': 'You blend organization with people skills - excellent for Project Management or Technical Lead positions.',
            'Conscientiousness-Agreeableness': 'Your reliability and teamwork orientation make you valuable in QA, Support, or Operations roles.',
            'Extraversion-Agreeableness': 'Your social and supportive nature suits customer-facing technical roles or team leadership.',
            'Openness-Agreeableness': 'You combine innovation with empathy - great for UX Research or Technical Writing roles.'
        };
        
        const insight = comboInsights[combo] || comboInsights[`${categories[1].categoryName}-${categories[0].categoryName}`];
        if (insight) {
            recommendations.push({
                title: 'Personality Combination Insight',
                content: insight
            });
        }
    }
    
    return recommendations;
};

const generateAssessmentReport = async (userId, userName, userEmail, categories, overAllTags, potentialEmployers = [], matchedJobs = []) => {
    return new Promise((resolve, reject) => {
        try {
            // Create Reports directory if it doesn't exist
            const reportsDir = path.join(__dirname, '..', 'data', 'Reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            // Generate unique filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `Assessment_Report_${userId}_${timestamp}.pdf`;
            const filePath = path.join(reportsDir, filename);

            // Create PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true,
                info: {
                    Title: 'Personality Assessment Report - JobNest',
                    Author: 'JobNest',
                    Subject: 'Big Five Personality Assessment Results',
                    Creator: 'JobNest Assessment System'
                }
            });

            // Pipe to file
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // Colors
            const primaryColor = '#4F46E5';
            const secondaryColor = '#7C3AED';
            const successColor = '#10B981';
            const warningColor = '#F59E0B';
            const dangerColor = '#EF4444';
            const textColor = '#1F2937';
            const lightGray = '#F3F4F6';
            const mediumGray = '#9CA3AF';

            // ============ PAGE 1: HEADER & PERSONALITY PROFILE ============
            
            // Header with gradient-like effect
            doc.rect(0, 0, doc.page.width, 140).fill(primaryColor);
            
            // Logo area
            doc.fontSize(32)
               .fillColor('#FFFFFF')
               .font('Helvetica-Bold')
               .text('JobNest', 50, 30);
            
            doc.fontSize(12)
               .font('Helvetica')
               .fillColor('#E0E7FF')
               .text('Personality-Based Job Matching Platform', 50, 65);

            doc.fontSize(24)
               .font('Helvetica-Bold')
               .fillColor('#FFFFFF')
               .text('PERSONALITY ASSESSMENT REPORT', 50, 95, { align: 'center' });

            // User Info Box
            let yPos = 160;
            doc.roundedRect(50, yPos, doc.page.width - 100, 80, 8)
               .fill('#F8FAFC');
            
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor(mediumGray)
               .text('CANDIDATE', 70, yPos + 15);
            
            doc.fontSize(18)
               .font('Helvetica-Bold')
               .fillColor(textColor)
               .text(userName || 'Anonymous User', 70, yPos + 32);

            doc.fontSize(10)
               .font('Helvetica')
               .fillColor(mediumGray)
               .text(userEmail || 'No email provided', 70, yPos + 55);

            // Date on right side
            doc.fontSize(10)
               .fillColor(mediumGray)
               .text(`Report Generated: ${new Date().toLocaleDateString('en-US', { 
                   year: 'numeric', 
                   month: 'long', 
                   day: 'numeric',
                   hour: '2-digit',
                   minute: '2-digit'
               })}`, doc.page.width - 250, yPos + 35, { align: 'right', width: 180 });

            // Divider
            yPos = 260;
            doc.moveTo(50, yPos).lineTo(doc.page.width - 50, yPos).stroke('#E5E7EB');

            // ============ PERSONALITY PROFILE SECTION ============
            yPos = 280;
            doc.fontSize(20)
               .font('Helvetica-Bold')
               .fillColor(primaryColor)
               .text(' Your Personality Profile', 50, yPos);

            doc.fontSize(10)
               .font('Helvetica')
               .fillColor(mediumGray)
               .text('Based on the Big Five (OCEAN) Personality Model', 50, yPos + 25);

            yPos += 55;

            // Category descriptions
            const categoryDescriptions = {
                'Openness': 'Creativity, curiosity, and openness to new experiences. High scorers are imaginative and open to trying new things.',
                'Conscientiousness': 'Organization, dependability, and self-discipline. High scorers are reliable, hardworking, and goal-oriented.',
                'Extraversion': 'Sociability, assertiveness, and positive emotions. High scorers are outgoing and energized by social interactions.',
                'Agreeableness': 'Cooperation, trust, and helpfulness. High scorers are friendly, compassionate, and value harmony.',
                'Neuroticism': 'Emotional sensitivity and stress response. High scorers may experience more anxiety but are often detail-oriented.'
            };

            const categoryIcons = { 
                'Openness': '💡',
                'Conscientiousness': '📋',
                'Extraversion': '🗣️',
                'Agreeableness': '🤝',
                'Neuroticism': '🎯'
            };

            // Draw each category with enhanced visuals
            if (categories && categories.length > 0) {
                categories.forEach((category, index) => {
                    const catName = category.categoryName || 'Unknown';
                    const score = Math.round(category.score) || 0;
                    const icon = categoryIcons[catName] || '📊';
                    
                    // Category box
                    doc.roundedRect(50, yPos, doc.page.width - 100, 70, 6)
                       .fill(index === 0 ? '#EEF2FF' : '#FAFAFA');
                    
                    // Rank badge
                    const rankColors = ['#4F46E5', '#7C3AED', '#A855F7'];
                    doc.circle(70, yPos + 20, 12).fill(rankColors[index] || mediumGray);
                    doc.fontSize(10)
                       .font('Helvetica-Bold')
                       .fillColor('#FFFFFF')
                       .text(`${index + 1}`, 68, yPos + 17);

                    // Category name with icon
                    doc.fontSize(14)
                       .font('Helvetica-Bold')
                       .fillColor(textColor)
                       .text(`${catName}`, 95, yPos + 12);

                    // Score percentage on right
                    const scoreColor = score >= 70 ? successColor : score >= 40 ? warningColor : dangerColor;
                    doc.fontSize(20)
                       .font('Helvetica-Bold')
                       .fillColor(scoreColor)
                       .text(`${score}%`, doc.page.width - 120, yPos + 10, { align: 'right', width: 50 });

                    // Score bar
                    const barWidth = doc.page.width - 180;
                    const barHeight = 8;
                    const barY = yPos + 35;
                    doc.roundedRect(95, barY, barWidth, barHeight, 4).fill(lightGray);
                    const fillWidth = Math.max(0, (score / 100) * barWidth);
                    if (fillWidth > 0) {
                        doc.roundedRect(95, barY, fillWidth, barHeight, 4).fill(scoreColor);
                    }

                    // Category description
                    doc.fontSize(8)
                       .font('Helvetica')
                       .fillColor(mediumGray)
                       .text(categoryDescriptions[catName] || '', 95, yPos + 48, { 
                           width: barWidth,
                           lineGap: 1
                       });

                    yPos += 80;
                });
            } else {
                doc.fontSize(12)
                   .font('Helvetica')
                   .fillColor(dangerColor)
                   .text('No personality data available. Please retake the assessment.', 50, yPos);
                yPos += 30;
            }

            // ============ PERSONALITY TAGS SECTION ============
            yPos += 10;
            doc.moveTo(50, yPos).lineTo(doc.page.width - 50, yPos).stroke('#E5E7EB');
            yPos += 20;

            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor(primaryColor)
               .text('Your Personality Tags', 50, yPos);

            yPos += 30;

            if (overAllTags && overAllTags.length > 0) {
                let xPos = 50;
                const tagHeight = 26;
                const tagPadding = 14;
                const maxWidth = doc.page.width - 100;
                const tagColors = ['#EEF2FF', '#F0FDF4', '#FEF3C7', '#FCE7F3', '#E0E7FF'];

                overAllTags.forEach((tag, index) => {
                    const tagText = String(tag);
                    const tagWidth = doc.widthOfString(tagText) + tagPadding * 2;
                    
                    if (xPos + tagWidth > maxWidth + 50) {
                        xPos = 50;
                        yPos += tagHeight + 10;
                    }

                    doc.roundedRect(xPos, yPos, tagWidth, tagHeight, 13)
                       .fill(tagColors[index % tagColors.length]);

                    doc.fontSize(10)
                       .font('Helvetica-Bold')
                       .fillColor(primaryColor)
                       .text(tagText, xPos + tagPadding, yPos + 8);

                    xPos += tagWidth + 10;
                });

                yPos += tagHeight + 30;
            } else {
                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor(mediumGray)
                   .text('No personality tags generated.', 50, yPos);
                yPos += 20;
            }

            // ============ PAGE 2: CAREER RECOMMENDATIONS ============
            doc.addPage();
            yPos = 50;

            doc.fontSize(20)
               .font('Helvetica-Bold')
               .fillColor(primaryColor)
               .text('Career Recommendations', 50, yPos);

            yPos += 40;

            const recommendations = generateCareerRecommendations(categories || []);
            
            if (recommendations.length > 0) {
                recommendations.forEach((rec, index) => {
                    doc.roundedRect(50, yPos, doc.page.width - 100, 60, 6)
                       .fill(index % 2 === 0 ? '#F0FDF4' : '#FEF3C7');
                    
                    doc.fontSize(12)
                       .font('Helvetica-Bold')
                       .fillColor(textColor)
                       .text(rec.title, 70, yPos + 12);
                    
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor('#374151')
                       .text(rec.content, 70, yPos + 30, { 
                           width: doc.page.width - 160,
                           lineGap: 2
                       });
                    
                    yPos += 70;
                });
            }

            // Ideal Job Roles based on top trait
            yPos += 10;
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor(primaryColor)
               .text('Recommended Job Roles', 50, yPos);

            yPos += 25;

            const topMapping = personalityJobMapping[categories?.[0]?.categoryName];
            if (topMapping) {
                topMapping.idealRoles.forEach((role, index) => {
                    doc.fontSize(11)
                       .font('Helvetica')
                       .fillColor(textColor)
                       .text(`${index + 1}. ${role}`, 70, yPos);
                    yPos += 20;
                });
            }

            // ============ MATCHED JOBS SECTION ============
            yPos += 20;
            doc.moveTo(50, yPos).lineTo(doc.page.width - 50, yPos).stroke('#E5E7EB');
            yPos += 20;

            doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor(primaryColor)
               .text('Job Matches Based on Your Profile', 50, yPos);

            yPos += 30;

            if (matchedJobs && matchedJobs.length > 0) {
                matchedJobs.slice(0, 5).forEach((job, index) => {
                    const matchScore = calculateJobMatchScore(job, categories || []);
                    const scoreColor = matchScore >= 70 ? successColor : matchScore >= 40 ? warningColor : dangerColor;
                    
                    // Check if we need a new page
                    if (yPos > doc.page.height - 120) {
                        doc.addPage();
                        yPos = 50;
                    }

                    doc.roundedRect(50, yPos, doc.page.width - 100, 80, 6)
                       .fill('#FAFAFA');
                    
                    // Job title
                    doc.fontSize(13)
                       .font('Helvetica-Bold')
                       .fillColor(textColor)
                       .text(job.jobTitle || 'Untitled Position', 70, yPos + 12);
                    
                    // Match score badge
                    doc.roundedRect(doc.page.width - 130, yPos + 10, 60, 24, 12)
                       .fill(scoreColor);
                    doc.fontSize(10)
                       .font('Helvetica-Bold')
                       .fillColor('#FFFFFF')
                       .text(`${matchScore}%`, doc.page.width - 125, yPos + 16, { width: 50, align: 'center' });
                    
                    // Job details
                    doc.fontSize(10)
                       .font('Helvetica')
                       .fillColor(mediumGray)
                       .text(`${job.location || 'Remote'} | ${job.salary || 'Competitive'} | ${job.jobPreference || 'Flexible'}`, 70, yPos + 32);
                    
                    // Skills
                    const skills = (job.skills || []).slice(0, 4).join(', ');
                    doc.fontSize(9)
                       .text(`Skills: ${skills}`, 70, yPos + 50);
                    
                    // Description snippet
                    const desc = (job.description || '').substring(0, 100);
                    doc.fontSize(8)
                       .fillColor('#6B7280')
                       .text(desc + (desc.length >= 100 ? '...' : ''), 70, yPos + 65, { width: doc.page.width - 160 });

                    yPos += 95;
                });
            } else if (potentialEmployers && potentialEmployers.length > 0) {
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor(textColor)
                   .text('Companies that match your personality profile:', 50, yPos);
                yPos += 25;

                potentialEmployers.forEach((employer, index) => {
                    doc.fontSize(11)
                       .text(`${index + 1}. ${employer}`, 70, yPos);
                    yPos += 20;
                });
            } else {
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor(mediumGray)
                   .text('No job matches found. Update your profile and skills to see personalized job recommendations.', 50, yPos, {
                       width: doc.page.width - 100
                   });
            }

            // ============ FOOTER ON ALL PAGES ============
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                
                // Footer line
                doc.moveTo(50, doc.page.height - 60)
                   .lineTo(doc.page.width - 50, doc.page.height - 60)
                   .stroke('#E5E7EB');
                
                // Footer text
                doc.fontSize(8)
                   .font('Helvetica')
                   .fillColor(mediumGray)
                   .text('JobNest - Personality-Based Job Matching Platform', 50, doc.page.height - 45, {
                       align: 'center',
                       width: doc.page.width - 100
                   });
                
                doc.text(`Page ${i + 1} of ${pages.count} | Generated on ${new Date().toLocaleDateString()}`, 50, doc.page.height - 32, {
                    align: 'center',
                    width: doc.page.width - 100
                });
            }

            // Finalize PDF
            doc.end();

            writeStream.on('finish', () => {
                console.log(`PDF generated successfully: ${filename}`);
                resolve({
                    filename,
                    filePath,
                    relativePath: `/data/Reports/${filename}`
                });
            });

            writeStream.on('error', (err) => {
                console.error('PDF write error:', err);
                reject(err);
            });

        } catch (error) {
            console.error('PDF generation error:', error);
            reject(error);
        }
    });
};

module.exports = { generateAssessmentReport, calculateJobMatchScore, personalityJobMapping };
