// advocateModel.js (Model)

const mongoose = require("mongoose");
const argon2 = require("argon2");

const advocateSchema = new mongoose.Schema(
  {
    advocateId: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    fullName: {
      type: String,
      required: [true, "Advocate name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Email format is invalid"],
    },
    mobileNumber: {
      type: String,
      unique: true,
      match: [/^\d{10}$/, "Mobile number must be 10 digits"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    barLicenseNumber: {
      type: String,
      required: [true, "Bar license number is required"],
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      set: function(value) {
        // If the value is a string in ISO format, parse it to a Date object directly
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate)) {
          return parsedDate;
        }
        // Throw an error if the date is invalid
        throw new Error("Invalid date format");
      },
      get: function(value) {
        return value ? formatDateToDDMMYYYY(value) : value;
      }
    },
    
    specialization: {
      type: String // List of specializations for the advocate (e.g., "Criminal Law", "Civil Law")
    },
    advocate_location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      }
    },
    state: {
      type: String,
    },
    place: {
      type: String,
    },
    other_document: {
      type: String,
    },
    aadhar_document: {
      type: String,
    },
    profile_image: {
      type: String,
    },
    preferred_language: {
      type: String,
    },
    pincode: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false
  },
  },
  { timestamps: true }
);

//// Helper function to format date to 'dd-mm-yyyy'
function formatDateToDDMMYYYY(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

// Add a geospatial index to location
advocateSchema.index({ location: "2dsphere" });

// Password hashing middleware using Argon2
advocateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
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
