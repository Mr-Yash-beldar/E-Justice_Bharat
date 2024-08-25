
const mongoose = require('mongoose');
const argon2 = require('argon2');

const LitigantSchema = new mongoose.Schema({
    litigant_name: {
        type: String,
        required: true,
        set: (value)=> value.toLowerCase(), // Convert the name to lowercase before saving 
        get: (value)=> value.replace(/\b\w/g, (char) => char.toUpperCase())  // Capitalize the first letter of each word     
    },
    litigant_profile: {
        type: String,
        // required: true
    },
    litigant_state: {
        type: String,
        // required: true
    },
    litigant_district: {
        type: String,
        // required: true
    },
    litigant_gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        // required: true
    },
    litigant_dob: {
        type: Date,
        // required: true
    },
    litigant_mob: {
        type: String,
        // required: true,
        match: /^[0-9]{10}$/  // for a 10-digit mobile number
    },
    litigant_email: {
        type: String,
        // required: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/  //  email  validation
    },
    litigant_lat: {
        type: Number,
        // required: true
    },
    litigant_lang: {
        type: Number,
        // required: true
    },
    litigant_password: {
        type: String,
        required: true,
        select:false // Do not include the password in the JSON response
    },
    litigant_passkey: {
        type: String,
        // required: true
    },
    litigant_otp: {
        type: String,
        // required: true
    },
    litigant_drivers_licence: {
        type: String,
        // required: true
    },
    litigant_aadhar_proof: {
        type: String,
        // required: true
    },
    litigant_contact_details: {
        type: String,
        // required: true
    },
    litigant_pincode: {
        type: String,
        // required: true,
        match: /^[0-9]{6}$/  // for a 6-digit pincode
    }
}, {
    timestamps: true,  // Automatically adds createdAt and updatedAt timestamps
    toJSON: { getters: true }, // Ensure getters are applied when converting to JSON
    toObject: { getters: true } // Ensure getters are applied when converting to objects
});

// Hash password before saving
LitigantSchema.pre('save', async function(next) {
    if (this.isModified('litigant_password')) {
        try {
            this.litigant_password = await argon2.hash(this.litigant_password);
        } catch (err) {
            return next(err);
        }
    }
    next();
});

LitigantSchema.post('save', async function(doc) {
    try {

        // Create a new OTP entry
        const otpEntry = new OTP({
            userId: doc._id,
            otp: null, // OTP will be generated later when requested
            expiresAt: null // Expiry will be set when OTP is generated
        });

        await otpEntry.save();
        console.log('OTP entry created successfully');
    } catch (err) {
        console.error('Error creating OTP entry:', err.message);
    }
});
const Litigant = mongoose.model('Litigant', LitigantSchema);

module.exports = Litigant;
