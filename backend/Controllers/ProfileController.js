const dbmodel = require('../utlities/connection');
const Profile = require('../models/profile')

const fs = require('fs');
const bcrypt = require('bcryptjs')


const JobSeekerController = {   
        updateJobSeekerProfile: async (req,res)=>{
            try{
                const{emailId, name, jobPreferences, skills, experience, socialProfiles} = req.body
                 if(!emailId){return res.status(400).json({error : "emailId is required"})}
                 const collection = await dbmodel.getJobSeekerCollection();
                 const existingUser = await collection.findOne({emailId:emailId})
                 if(!existingUser){return res.status(400).json({error : "user not found with this emailId"})}
                 const updatefields = {};
                 if (name) updatefields.name = name;
                 if (jobPreferences) updatefields.jobPreferences = jobPreferences;
                 if (skills) updatefields.skills = skills;
                 if (experience) updatefields.experience = experience;
                 if (socialProfiles) updatefields.socialProfiles = socialProfiles;

                 if(req.files){
                    if(req.files.resume && req.files.resume.length > 0){
                        updatefields.resume = req.files.resume[0].path;
                    }

                    if(req.files.coverLetter && req.files.coverLetter.length > 0){
                        updatefields.coverLetter = req.files.coverLetter[0].path;
                    }
                 }

                 await collection.updateOne(
                    {emailId: emailId}, {$set: updatefields}
                 );
                 return res.status(200).json({message:"Profile updated successfully"});
            }
            catch(error){
                return res.status(500).json({error: "internal server error"})
            }        
        }      
    }
module.exports = JobSeekerController;