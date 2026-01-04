class Job{
    constructor(object) {
        this.jobTitle = object.jobTitle
        this.salary= object.salary
        this.currencyType = object.currencyType
        this.skills = object.skills 
        this.experience = {minExperience:object.experience.minExperience, maxExperience:object.experience.maxExperience},
        this.location = object.location
        this.employeerId = object.employeerId 
        this.expiryDate = object.expiryDate
    }
}
module.exports = Job