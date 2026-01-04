class Profile {
    constructor(profile) {
        this.name= profile.name
        this.emailId = profile.emailId
        this.password= profile.password
        this.jobPreferences= profile.jobPrefernces
        this.resume= profile.resume
        this.coverLetter= profile.coverLetter
        this.socialProfiles= profile.socialProfiles || []
        this.score= profile.score
        this.experience = profile.experience
        this.skills = profile.skills || []
        this.userType = "JobSeeker"
    }
}
module.exports = Profile
