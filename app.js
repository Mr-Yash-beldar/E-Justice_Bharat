const express = require('express');
const { connectDB, disconnectDB } = require('./config/db'); // database connection and disconnection
const litigantRoutes = require('./routes/litigantRoutes'); // routes for litigants
const advocateRoutes = require('./routes/advocateRoutes'); // routes for advocates
const otpRoutes = require('./routes/otpRoutes'); // routes for OTP
const meetingRoutes = require("./routes/meetingRoutes"); // routes for meetings
const caseRoutes = require('./routes/caseRoutes'); // routes for cases
const authRoutes = require('./routes/authRoutes'); // routes for authentication
const fileRoutes = require('./routes/fileRoutes'); // routes for file uploads
const caseRequestRoutes = require('./routes/caseRequestRoutes'); // routes for case requests
const cors = require('cors'); // Import cors

const app = express();

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
connectDB();

// CORS Middleware
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend URL
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], // Include Authorization header
};

app.use(cors(corsOptions));

// Explicitly handle OPTIONS requests for preflight
app.options('*', cors(corsOptions));

// Routes and middleware
app.use('/litigants', litigantRoutes);
app.use('/advocates', advocateRoutes);
app.use('/email', otpRoutes);
app.use("/ejusticeBharat/meeting", meetingRoutes);
app.use('/cases', caseRoutes);
app.use('/auth', authRoutes);
app.use("/files", fileRoutes);
app.use("/request", caseRequestRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to eJustice Bharat');
});

// Graceful shutdown on SIGINT
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing MongoDB connection');
  await disconnectDB();
  process.exit(0);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
