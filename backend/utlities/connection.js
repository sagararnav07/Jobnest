const mongoose = require("mongoose");
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const url = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/Jobnest';

const jobseekerSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    name: { type: String, required: true },
    emailId: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for Clerk auth users
    clerkId: { type: String, sparse: true, unique: true }, // Clerk user ID
    authMethod: { type: String, enum: ['local', 'clerk'], default: 'local' },
    profileImage: { type: String }, // Clerk profile image URL
    jobPreference: { type: String },
    skills: { type: [String] },
    experience: { type: Number, default: 0 },
    resume: { data: Buffer, contenttype: String },
    coverLetter: { data: Buffer, contenttype: String },
    socialProfiles: { type: [String] },
    test: { type: Boolean, required: true, default: false },
    userType: { type: String, required: true, enum: ["Employeer", "Jobseeker"] },
    tags: { type: [String] },
    profileCompleted: { type: Boolean, default: false }
}, { collection: "Jobseeker" });

// Add indexes for jobseeker
jobseekerSchema.index({ skills: 1 });
jobseekerSchema.index({ jobPreference: 1 });
jobseekerSchema.index({ tags: 1 });


const employeerSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    name: { type: String, required: true },
    emailId: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for Clerk auth users
    clerkId: { type: String, sparse: true, unique: true }, // Clerk user ID
    authMethod: { type: String, enum: ['local', 'clerk'], default: 'local' },
    profileImage: { type: String }, // Clerk profile image URL
    description: { type: String },
    companyIcon: { data: Buffer, contenttype: String },
    userType: { type: String, required: true, enum: ["Employeer", "Jobseeker"] },
    industry: { type: String, enum: ["IT", "Manufacturing", "Production", "Services"] },
    linkedIn: { type: String },
    website: { type: String },
    tags: { type: [String] },
    profileCompleted: { type: Boolean, default: false }
}, { collection: "Employeer" });

// Add indexes for employer
employeerSchema.index({ tags: 1 });

const experienceSchema = Schema({
    minExperience: { type: Number },
    maxExperience: { type: Number }
})

const jobSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    jobTitle: { type: String, required: true, min: 4 },
    salary: { type: String, required: true },
    currencytype: { type: String, required: true },
    skills: { type: [String], required: true },
    description: { type: String, required: true },
    jobPreference: { type: String, required: true },
    experience: { type: experienceSchema, required: true },
    location: { type: String, required: true },
    postedDate: { type: Date, required: true, default: Date.now },
    expiryDate: { type: Date },
    employeerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Employeer" }
}, { collection: "Job" })

// Add indexes for jobs
jobSchema.index({ employeerId: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ jobPreference: 1 });
jobSchema.index({ postedDate: -1 });

const applicationSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Job" },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Jobseeker" },
    appliedAt: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ["Applied", "Inprogress", "Rejected", "To Be Interviewed", "Hired"], required: true, default: "Applied" },
}, { collection: "Application" })

// Add indexes for application queries
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true })
applicationSchema.index({ status: 1 })

const questionSchema = Schema({
    id: { type: String, required: true },
    // _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    text: { type: String, required: true },
    category: { type: String, required: true, enum: ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"] },
    isReversed: { type: Boolean, required: true }
}, { collection: "Question" })

const responseSchema = Schema({
    questionId: { type: String, required: true },
    // questionId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, ref: "Question", },
    score: { type: Number, min: 1, max: 5, required: true },
    category: { type: String, required: true, enum: ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"] },
})

const quizSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, ref: "Jobseeker" },
    responses: { type: [responseSchema] },
    submittedAt: { type: Date }
}, { collection: "Quiz" })


const messageSchema = Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Jobseeker" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    read: { type: Boolean, default: false }
}, { collection: "Message" })

// Add indexes for better query performance
messageSchema.index({ senderId: 1, receiverId: 1 })
messageSchema.index({ createdAt: -1 })

const categoriesSchema = Schema({
    categoryName: { type: String, required: true },
    score: { type: Number, required: true, default: 0 },
    tags: { type: [String] },
})
const resultSchema = Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
    categories: { type: [categoriesSchema], required: true },
    overAllTags: { type: [String], required: true },
    generatedAt: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, ref: "Jobseeker" }
}, { collection: "Result" })

// const reportSchema = Schema({
//     _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true },
//     userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true , ref: "Jobseeker"},
//     quizId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true , ref: "Quiz"},
//     resultId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), required: true, ref: "Result" },
// }, { collection: "Report" })

let collection = {}

//connects with JobSeeker Collection
collection.getJobSeekerCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('JobSeeker', jobseekerSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with Employeer Collection
collection.getEmployeerCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Employeer', employeerSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with Question Collection
collection.getQuestionCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Question', questionSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with Quiz Collection
collection.getQuizCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Quiz', quizSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with catgory collection
collection.getCategoryCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Category', categoriesSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with result collection
collection.getResultCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Result', resultSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with Job collection
collection.getJobCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Job', jobSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with Application collection
collection.getApplicationCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Application', applicationSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

//connects with Message collection
collection.getMessageCollection = async () => {
    try {
        await mongoose.connect(url);
        const model = await mongoose.model('Message', messageSchema);
        return model;
    } catch (err) {
        let error = new Error("Could not connect to database")
        error.status = 500;
        throw error;
    }
}

module.exports = collection;