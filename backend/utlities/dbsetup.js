const mongoose = require('mongoose');
const collection = require('./connection');



const jobSeekerDb = [
 { name: "Aarav Singh", emailId: "aarav@example.com",
  password: "Infosys" ,userType:"Jobseeker", test: false},
 { name: "Riya Kapoor", emailId: "riya@example.com",password: "Infosys" , resume: "resume_js2.pdf", userType:"Jobseeker",skills: ["Java", "Spring"], jobPreference:"Developer", experience: 3,test:1 },
 { name: "Karan Patel", emailId: "karan@example.com",password: "Infosys" , resume: "resume_js3.pdf", userType:"Jobseeker",skills: ["Python", "Django"], jobPreference:"Tester",experience: 1 ,test:1},
 { name: "Saanvi Reddy", emailId: "saanvi@example.com",password: "Infosys" , resume: "resume_js4.pdf",userType:"Jobseeker", skills: ["Testing", "Selenium"], jobPreference:"Day Shift",experience: 4 ,test:1},
 { name: "Ananya Verma", emailId: "ananya@example.com",password: "Infosys" , resume: "resume_js5.pdf", userType:"Jobseeker",skills: ["SQL", "Excel", "PowerBI"],jobPreference:"Analyst", experience: 2,test:1 },
 { name: "Dev Mehta", emailId: "dev@example.com",password: "Infosys" , resume: "resume_js6.pdf", userType:"Jobseeker",skills: ["Flutter"], experience: 1,jobPreference:"Online",test:1 },
 { name: "Ishita Shah", emailId: "ishita@example.com",password: "Infosys" , resume: "resume_js7.pdf",userType:"Jobseeker", skills: ["UI/UX"], jobPreference:"Developer",experience: 2,test:1 },
 { name: "Rohan Das", emailId: "rohan@example.com",password: "Infosys" , resume: "resume_js8.pdf",userType:"Jobseeker", skills: ["DevOps", "AWS","PowerBI"], experience: 5 ,jobPreference:"Intern",test:1},
 { name: "Meera Joshi", emailId: "meera@example.com",password: "Infosys" , resume: "resume_js9.pdf",userType:"Jobseeker", skills: ["Data Science","SQL", "Excel", "PowerBI"], experience: 1,jobPreference:"Day Shift",test:1 },
 {  name: "Ayaan Khan", emailId: "ayaan@example.com",password: "Infosys" , resume: "resume_js10.pdf",userType:"Jobseeker", skills: ["Andro_id"], experience: 3 ,jobPreference:"Day Shift",test:1}
]

 const employeerDb =[
 {
   name: "TechNova Solutions",
   emailId: "hr@technova.com",
   password: "hashedpassword123",
   description: "We provide AI and cloud-based software solutions.",
   companyIcon: { "data": null, "contenttype": "" },
   userType: "Employeer",
   industry: "IT",
   linkedIn: "https://linkedin.com/company/technova",
   website: "https://www.technova.com"
 },
 {
   name: "BlueRiver Manufacturing",
   emailId: "contact@bluerivermfg.com",
   password: "hashedpassword456",
   description: "A leading manufacturer of industrial machinery.",
   companyIcon: { "data": null, "contenttype": "" },
   userType: "Employeer",
   industry: "Manufacturing",
   linkedIn: "https://linkedin.com/company/blueriver",
   website: "https://www.bluerivermfg.com"
 },
 {
   name: "ProServe Consulting",
   emailId: "info@proserveconsulting.com",
   password: "pass123hash",
   description: "Consulting firm helping businesses scale operations.",
   companyIcon: { "data": null, "contenttype": "" },
   userType: "Employeer",
   industry: "Services",
   linkedIn: "https://linkedin.com/company/proserve",
   website: "https://www.proserveconsulting.com"
 },
 {
   name: "FutureWorks IT Labs",
   emailId: "careers@futureworks.com",
   password: "securepasshash",
   description: "Specialized in automation, IoT, and custom IT development.",
   companyIcon: { "data": null, "contenttype": "" },
   userType: "Employeer",
   industry: "IT",
   linkedIn: "https://linkedin.com/company/futureworks",
   website: "https://www.futureworks.com"
 },
 {
  
   name: "SteelCraft Industries",
   emailId: "jobs@steelcraft.com",
   password: "hashpass555",
   description: "Production and fabrication of steel materials.",
   companyIcon: { "data": null, "contenttype": "" },
   userType: "Employeer",
   industry: "Production",
   linkedIn: "https://linkedin.com/company/steelcraft",
   website: "https://www.steelcraft.com"
 },
 {

   name: "SmartServe Digital",
   emailId: "admin@smartserve.com",
   password: "hashpass666",
   description: "Digital Services agency with global operations.",
   companyIcon: { "data": null, "contenttype": "" },
   userType: "Employeer",
   industry: "Services",
   linkedIn: "https://linkedin.com/company/smartserve",
   website: "https://www.smartserve.com"
 },
 {
  
   name: "MegaTech Systems",
   emailId: "hello@megatech.com",
   password: "passhash789",
   description: "Enterprise software and cloud consulting provider.",
   companyIcon: { "data": null, "contenttype": "" },
   userType: "Employeer",
   industry: "IT",
   linkedIn: "https://linkedin.com/company/megatech",
   website: "https://www.megatech.com"
 },
 {

   name: "Prime Manufacturing Co.",
   emailId: "support@primemfg.com",
   password: "hashprime123",
   description: "Manufacturers of high-precision mechanical components.",
   companyIcon: { "data": null, "contenttype": "" },
   userType: "Employeer",
   industry: "Manufacturing",
   linkedIn: "https://linkedin.com/company/primemfg",
   website: "https://www.primemfg.com"
 },
 {

   name: "AgroPro Services",
   emailId: "info@agroproServices.com",
   password: "hashagro999",
   description: "Agricultural consultancy and field operations support.",
   companyIcon: { "data": null, "contenttype": "" },
   userType: "Employeer",
   industry: "Services",
   linkedIn: "https://linkedin.com/company/agropro",
   website: "https://www.agroproServices.com"
 },
 {
   name: "ProdMaster Automation",
   emailId: "automation@prodmaster.com",
   password: "prodhash123",
   description: "Production automation solutions for large industries.",
   companyIcon: { "data": null, "contenttype": "" },
   userType: "Employeer",
   industry: "Production",
   linkedIn: "https://linkedin.com/company/prodmaster",
   website: "https://www.prodmaster.com"
 }
]

const jobDb=[
  
 {
   _id: "673f100ea1b2c10001a10001",
   jobTitle: "Full Stack Developer",
   salary: "12 LPA",
   currencytype: "INR",
   skills: ["JavaScript", "React", "Node.js","SQL"],
   description: "Develop scalable web applications.",
   jobPreference: "Day Shift",
   experience: { "minExperience": 2, "maxExperience": 4 },
   location: "Bangalore",
   postedDate: "2025-02-01T10:00:00Z",
   expiryDate: "2025-03-01T10:00:00Z",
   employeerId: "673f1010a1b2c10001a20001"
 },
 {
   _id: "673f100ea1b2c10001a10002",
   jobTitle: "Backend Developer",
   salary: "9 LPA",
   currencytype: "INR",
   skills: ["Node.js", "Express", "MongoDB"],
   description: "Build backend APIs and microservices.",
   jobPreference: "Work From Home",
   experience: { "minExperience": 1, "maxExperience": 3 },
   location: "Remote",
   postedDate: "2025-01-20T09:00:00Z",
   expiryDate: "2025-02-20T09:00:00Z",
   employeerId: "673f1010a1b2c10001a20002"
 },
 {
   _id: "673f100ea1b2c10001a10003",
   jobTitle: "Frontend Developer",
   salary: "7 LPA",
   currencytype: "INR",
   skills:[ "HTML", "CSS", "JavaScript", "Vue.js"],
   description: "Create responsive UI components.",
   jobPreference: "Hybrid",
   experience: { "minExperience": 0, "maxExperience": 2 },
   location: "Mumbai",
   postedDate: "2025-02-05T11:30:00Z",
   expiryDate: "2025-03-05T11:30:00Z",
   employeerId: "673f1010a1b2c10001a20003"
 },
 {
   _id: "673f100ea1b2c10001a10004",
   jobTitle: "Data Analyst",
   salary: "10 LPA",
   currencytype: "INR",
   skills: ["SQL", "Excel", "PowerBI"],
   description: "Analyze business data trends.",
   jobPreference: "Day Shift",
   experience: { "minExperience": 1, "maxExperience": 3 },
   location: "Pune",
   postedDate: "2025-02-03T08:45:00Z",
   expiryDate: "2025-03-03T08:45:00Z",
   employeerId: "673f1010a1b2c10001a20004"
 },
 {
   _id: "673f100ea1b2c10001a10005",
   jobTitle: "UI/UX Designer",
   salary: "8 LPA",
   currencytype: "INR",
   skills: ["Figma", "Adobe XD", "Wireframing"],
   description: "Design user-friendly interfaces.",
   jobPreference: "Onsite",
   experience: { "minExperience": 1, "maxExperience": 2 },
   location: "Delhi",
   postedDate: "2025-02-02T12:00:00Z",
   expiryDate: "2025-03-02T12:00:00Z",
   employeerId: "673f1010a1b2c10001a20005"
 }
]

exports.categoryDb = {
  "Openness": [
    "creative",
    "curious",
    "open-minded",
    "imaginative",
    "innovative",
    "explorer"
  ],
  "Conscientiousness": [
    "organized",
    "disciplined",
    "goal-oriented",
    "responsible",
    "methodical",
    "hardworking"
  ],
  "Extraversion": [
    "outgoing",
    "energetic",
    "people-oriented",
    "expressive",
    "active",
    "sociable"
  ],
  "Agreeableness": [
    "cooperative",
    "empathetic",
    "trusting",
    "helpful",
    "kind",
    "supportive"
  ],
  "Neuroticism": [
    "stress-prone",
    "anxious",
    "sensitive",
    "self-conscious",
    "moody",
    "easily-upset"
  ]
}

exports.setupDb = async() => {
    let jobseeker = await collection.getJobSeekerCollection();
    await jobseeker.deleteMany({});
    let jobseekerData = await jobseeker.insertMany(jobSeekerDb);

    let employeer = await collection.getEmployeerCollection();
    await employeer.deleteMany({});
    let employeerData = await employeer.insertMany(employeerDb);

    let job = await collection.getJobCollection();
    await job.deleteMany({});
    let jobData = await job.insertMany(jobDb)  

    if (jobseekerData && employeerData && jobData) {
        return "Insertion Successful"
    } else {
        let err = new Error("Insertion failed");
        err.status = 400;
        throw err;
    }
}
