const multer = require('multer');
const { upload }= require('../utlities/multerSetup');
const jwt = require("jsonwebtoken");
const dbModel = require('./../utlities/connection');


exports.getEmployerNameById = async (id) => {
  try{
    const employerCollection = await dbModel.getEmployeerCollection()
    const employer = await employerCollection.findOne({_id:id})
    if(!employer) {
      let error = new Error('No employer found')
      throw error
    }
    console.log('ln 15 ', employer);
    
    return employer
  }
  catch(err) {
    throw err

  }
}
exports.updateProfile = async (req, res, next) => {
  upload.single('companyIcon')(req, res, async function (err) {
    if (err) {
      return next(err);
    }

    try {
      const employeerCollection = await dbModel.getEmployeerCollection();
      const userId = req.userId;
      const { description, linkedin, website, industry, skills } = req.body;
      const companyIcon = req.file ? req.file.path : '';
      
      // Fetch existing profile
      let profile = await employeerCollection.findOne({ _id:userId });

      if (!profile) {
        throw new Error("Employer profile not found");
      }

      // Conditionally update fields
      const updateFields = {};
      if (description) updateFields.description = description;
      if (linkedin) updateFields.linkedIn = linkedin;
      if (website) updateFields.website = website;
      if (companyIcon) updateFields.companyIcon = companyIcon;
      if (industry) updateFields.industry = industry;
      if (skills && skills.length > 0) updateFields.skills = skills;
      if (Object.keys(updateFields).length === 0) {
        // throw new Error("No fields to update");
        let error = new Error("No fields to update" )
        error.status = 400
        throw error
      }

      const updateResult = await employeerCollection.updateOne({ _id: userId }, { $set: updateFields });
      
      if (updateResult.modifiedCount === 0) {
        // throw new Error("Employer profile update failed");
        let error = new Error("Employer profile update failed" )
        error.status = 404
        throw error
      }
      // Optionally fetch and return the updated profile
      const updatedProfile = await employeerCollection.findOne({ _id: userId });
      if(updatedProfile)
      return res.json({ message: "Employer profile updated", profile: updatedProfile });
      else {
        let error= new Error('Unable to get employeer details')
        error.status = 500
        throw error
      }
    } catch (error) {
      next(error);
    }
  });
};

exports.getProfile = async (req, res, next) => {
  try {
    const employeerCollection = await dbModel.getEmployeerCollection();
    const userId = req.userId;
    const profile = await employeerCollection.findOne({ _id: userId });
    if (!profile) {
      let error = new Error("Employer profile not found");
      error.status = 404;
      throw error;
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};


exports.createJob = async (req, res, next) => {
  // TODO: Implement createJob
  res.status(501).json({ message: "Not Implemented" });
};

exports.getMyJobs = async (req, res, next) => {
  // TODO: Implement getMyJobs
  res.status(501).json({ message: "Not Implemented" });
};

exports.getJobById = async (req, res, next) => {
  // TODO: Implement getJobById
  res.status(501).json({ message: "Not Implemented" });
};

exports.updateJob = async (req, res, next) => {
  // TODO: Implement updateJob
  res.status(501).json({ message: "Not Implemented" });
};

exports.deleteJob = async (req, res, next) => {
  // TODO: Implement deleteJob
  res.status(501).json({ message: "Not Implemented" });
};

exports.getApplications = async (req, res, next) => {
  // TODO: Implement getApplications
  res.status(501).json({ message: "Not Implemented" });
};

exports.getJobApplications = async (req, res, next) => {
  // TODO: Implement getJobApplications
  res.status(501).json({ message: "Not Implemented" });
};

exports.updateApplicationStatus = async (req, res, next) => {
  // TODO: Implement updateApplicationStatus
  res.status(501).json({ message: "Not Implemented" });
};
