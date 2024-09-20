// advocateModel.js (Model)

const mongoose = require("mongoose");
const argon2 = require("argon2");

const advocateSchema = new mongoose.Schema({
  advocateId: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  fullName: {
    type: String,
    required: [true, "Advocate name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Email format is invalid']
  },
  mobileNumber: {
    type: String,
    required: [true, "Mobile number is required"],
    unique: true,
    match: [/^\d{10}$/, 'Mobile number must be 10 digits']
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  barLicenseNumber: {
    type: String,
    required: [true, "Bar license number is required"],
    unique: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Date of birth is required"]
  },
  specialization: {
    type: [String], // List of specializations for the advocate (e.g., "Criminal Law", "Civil Law")
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  state: {
    type: String,
    required: [true, "State is required"]
  },
  place: {
    type: String,
    required: [true, "Place is required"]
  },
  digitalSignature: {
    type: String
  },
  profileImage: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, { timestamps: true });

// Add a geospatial index to location
advocateSchema.index({ location: '2dsphere' });

// Password hashing middleware using Argon2
advocateSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (err) {
    return next(err);
  }
});

// Method to check password validity
advocateSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (err) {
    throw new Error("Password comparison failed");
  }
};

module.exports = mongoose.model("Advocate", advocateSchema);
