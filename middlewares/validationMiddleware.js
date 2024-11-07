
const validator = require('validator');

// Validate signup data
const validateSignup = (req, res, next) => {
  const { litigant_name, litigant_email, litigant_password, litigant_confirm_password, litigant_mob } = req.body;
  // console.log(req.body);
  // check if data is present or null
  if (!litigant_name || !litigant_email || !litigant_password || !litigant_confirm_password || !litigant_mob) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // check if name is valid
  if (litigant_name && !/^[a-zA-Z\s]+$/.test(litigant_name)) {
    return res.status(400).json({ error: 'Invalid name format. Name should contain only letters and spaces.' });
  }

  // check if email is valid
  if (!validator.isEmail(litigant_email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  // check if phone number is valid
  if (!validator.isMobilePhone(litigant_mob) || litigant_mob.length !== 10) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  // check if password is matching
  if (litigant_password !== litigant_confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  next();
};

//validate profile update data
const validateProfile = (req, res, next) => {
  const {
    litigant_name,
    litigant_mob,
    litigant_pincode,
    litigant_dob,
  } = req.body;

  // Validate litigant_name (ensure it's not empty and only contains letters)
  if (litigant_name && !/^[a-zA-Z\s]+$/.test(litigant_name)) {
    return res.status(400).json({ error: 'Invalid name format. Name should contain only letters and spaces.' });
  }

  // Validate mobile number (must be 10 digits)
  if (litigant_mob && (!validator.isMobilePhone(litigant_mob, 'any', { strictMode: false }) || litigant_mob.length !== 10)) {
    return res.status(400).json({ error: 'Invalid mobile number. It must be a 10-digit number.' });
  }

  // Validate pincode (must be exactly 6 digits)
  if (litigant_pincode && !validator.matches(litigant_pincode, /^[0-9]{6}$/)) {
    return res.status(400).json({ error: 'Invalid pincode format. It must be a 6-digit number.' });
  }

  // Validate date of birth (ensure it's a valid date and in the past)
  if (litigant_dob && !validator.isDate(litigant_dob)) {
    return res.status(400).json({ error: 'Invalid date of birth format.' });
  }

  // If all validations pass, proceed to the next middleware or route handler
  next();
};

module.exports = { validateSignup, validateProfile };
