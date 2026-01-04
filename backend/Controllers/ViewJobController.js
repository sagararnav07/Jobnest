const dbmodel = require('../utlities/connection');

const Job={}

Job.viewJobs=async(userId)=>{  
    try{  
        const model = await dbmodel.getJobCollection();
        const jobSeekerModel = await dbmodel.getJobSeekerCollection()
        const user = await jobSeekerModel.findOne({_id:userId})

        if(!user) {
            let error= new Error("User not found")
            error.status=404
            throw error 
        }
        let jobPreference = user.jobPreference
        let skillsArray = user.skills
        const skills = Array.isArray(skillsArray) ? skillsArray : [];  
        
        const filter = {};  

        // Add jobPreference to filter only if it is a non-empty string  
        if(typeof jobPreference === 'string' && jobPreference.trim() !== ''){  
            filter.jobPreference = jobPreference;  
        }  
         
        let skillsIn = []
        // Add skills filter only if skills array has elements  
        if(skills.length > 0){  
            skillsIn = filter.skills = skills.map(skill => skill.trim()).filter(skill => skill !== '');  
        }

        const totalJobsCount = await model.countDocuments({});

        // Build query based on available filters
        let query = {};
        if (filter.jobPreference && filter.skills && filter.skills.length > 0) {
            query = { $and: [{ jobPreference: filter.jobPreference }, { skills: { $in: filter.skills } }] };
        } else if (filter.jobPreference) {
            query = { jobPreference: filter.jobPreference };
        } else if (filter.skills && filter.skills.length > 0) {
            query = { skills: { $in: filter.skills } };
        }

        let jobs = await model.find(query);

        if(!jobs || jobs.length === 0){
            // Try fallback: only jobPreference filter if skills filter returns nothing and jobPreference exists
            if(filter.jobPreference){
                let fallbackFilter = {jobPreference: filter.jobPreference};
                let fallbackJobs = await model.find(fallbackFilter);
                if(fallbackJobs && fallbackJobs.length > 0){
                    return fallbackJobs;
                }
            }
            // Try fallback: only skills filter if jobPreference filter returns nothing and skills filter exists
            if(filter.skills){
                let fallbackFilter = {skills: filter.skills};
                let fallbackJobs = await model.find(fallbackFilter);
                if(fallbackJobs && fallbackJobs.length > 0){
                    return fallbackJobs;
                }
            }

            let error = new Error("No matching jobs found");
            error.status = 404;
            throw error
        }else{
            return jobs
        }
    }catch(error){
        throw error
    }
}

module.exports = Job
