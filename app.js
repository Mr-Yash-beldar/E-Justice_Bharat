
const express = require('express');
const { connectDB, disconnectDB } = require('./config/db');  //database connection and disconnection
const litigantRoutes = require('./routes/litigantRoutes'); // routes for litigants
const advocateRoutes = require('./routes/advocateRoutes'); // routes for advocates
const otpRoutes = require('./routes/otpRoutes'); // routes for otp
const meetingRoutes = require("./routes/meetingRoutes"); //routes for meeting
const caseRoutes = require('./routes/caseRoutes'); // routes for cases
const authRoutes = require('./routes/authRoutes'); // routes for authentication
const fileRoutes = require('./routes/fileRoutes'); // routes for file upload
const cors = require('cors'); // Import cors
const app = express();
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies



app.use(express.json()); // Parse JSON bodies

// Connect to database ejusticeBharat
connectDB();

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow credentials if needed
}));

// routes and middleware
app.use('/litigants', litigantRoutes); // Use litigant routes
app.use('/advocates', advocateRoutes); // Use advocate routes
app.use('/email', otpRoutes); // Use otp routes
app.use("/ejusticeBharat/meeting", meetingRoutes); // Use meeting routes
app.use('/cases', caseRoutes); // Use case routes
app.use('/auth', authRoutes);
app.use("/files", fileRoutes);

// for handling the error and sending the response to the client 
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing MongoDB connection');
  await disconnectDB();
  process.exit(0);
});

app.get('/', (req, res) => {
  res.send('Welcome to eJustice Bharat');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




