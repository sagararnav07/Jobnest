class Users {
    constructor(user) {
        this.name = user.name;
        this.emailId = user.emailId;
        this.password = user.password;
        this.userType = user.userType;
    }
    // contructor(name, password, jobPrefernces, resume, coverLetter, socialProfiles, score) {
    //     this.name= name
    //     this.password= password
    //     this.jobPreferences= jobPrefernces
    //     this.resume= resume
    //     this.coverLetter= coverLetter
    //     this.socialProfiles= socialProfiles
    //     this.score= score
    // }
}
module.exports = Users
