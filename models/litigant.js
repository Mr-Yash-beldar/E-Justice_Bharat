
const mongoose = require('mongoose');
const argon2 = require('argon2');
const OTP = require('./otp'); // Import the OTP model

const LitigantSchema = new mongoose.Schema({
    litigant_name: {
        type: String,
        required: true,
        set: (value)=> value.toLowerCase(), // Convert the name to lowercase before saving 
        get: (value)=> value.replace(/\b\w/g, (char) => char.toUpperCase())  // Capitalize the first letter of each word     
    },
    profile_image: {
        type: String
    },
    litigant_state: {
        type: String
    },
    litigant_district: {
        type: String
    },
    litigant_gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    litigant_dob: {
        type: Date
    },
    litigant_mob: {
        type: String,
        match: /^[0-9]{10}$/  // for a 10-digit mobile number
    },
    litigant_email: {
        type: String,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,  //  email  validation
        unique: true,
        required: true
    },
     // Update to GeoJSON format for location
     litigant_location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true // Ensure coordinates are provided
        }
    },
    litigant_password: {
        type: String,
        required: true
    },
    litigant_passkey: {
        type: String
    },
    aadhar_document: {
        type: String
    },
    other_document: {
        type: String
    },
    litigant_pincode: {
        type: String,
        match: /^[0-9]{6}$/  // for a 6-digit pincode
    },
    litigant_address: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
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

// Create OTP entry only for new litigants
LitigantSchema.post('save', async function(doc) {
    if (doc.isNew) {
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
    }
});

const Litigant = mongoose.model('Litigant', LitigantSchema);

module.exports = Litigant;
