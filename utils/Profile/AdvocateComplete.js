// services/profileService.js

const calculateAdvocateProfileCompletion = (advocate) => {
    const requiredFields = [
        'fullName',
        'email',
        'mobileNumber',
        'password',
        'barLicenseNumber',
        'dateOfBirth',
        'specialization',
        'state',
        'advocate_location',
        'place',
        'aadhar_document',
        'other_document',
        'preferred_language',
        'pincode',
    ];

    const missingFields = requiredFields.filter(field => !advocate[field]);
    const completionPercentage = ((requiredFields.length - missingFields.length) / requiredFields.length) * 100;
  
    return {
      completionPercentage,
      missingFields
    };
};

module.exports = calculateAdvocateProfileCompletion;
