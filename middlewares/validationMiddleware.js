
const validator = require('validator');

// Validate signup data
const validateSignup = (req, res, next) => {
  const { litigant_name, litigant_email, litigant_password, litigant_confirm_password, litigant_mob } = req.body;
  // console.log(req.body);
  // check if data is present or null
  if (!litigant_name || !litigant_email || !litigant_password || !litigant_confirm_password || !litigant_mob) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!validator.isEmail(litigant_email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (!validator.isMobilePhone(litigant_mob, 'any', { strictMode: false })) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }
  if (litigant_password !== litigant_confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  next();
};

// Validate profile update data
const validateProfile = (req, res, next) => {
  const { litigant_name, litigant_mob, litigant_pincode } = req.body;

  if (litigant_mob && !validator.isMobilePhone(litigant_mob, 'any', { strictMode: false })) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }
  if (litigant_pincode && !validator.matches(litigant_pincode, /^[0-9]{6}$/)) {
    return res.status(400).json({ error: 'Invalid pincode format' });
  }

  next();
};

module.exports = { validateSignup, validateProfile };
