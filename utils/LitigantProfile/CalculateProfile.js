// services/profileService.js

const calculateLitigantProfileCompletion = (litigant) => {
    const requiredFields = [
        'litigant_name',
        'profile_image',
        'litigant_state',
        'litigant_district',
        'litigant_gender',
        'litigant_dob',
        'litigant_mob',
        'litigant_email',
        'litigant_lat',
        'litigant_lang',
        'litigant_password',
        'aadhar_document',
        'other_document',
        'litigant_pincode',
        'litigant_address',
    ];

    const missingFields = requiredFields.filter(field => !litigant[field]);
    const completionPercentage = ((requiredFields.length - missingFields.length) / requiredFields.length) * 100;
  
    return {
      completionPercentage,
      missingFields
    };
};

module.exports = calculateLitigantProfileCompletion;
