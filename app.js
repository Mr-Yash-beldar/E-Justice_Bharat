require('dotenv').config(); // by this we can use .env file

const express = require('express');
const { connectDB, disconnectDB } = require('./config/db');  //database connection and disconnection
const litigantRoutes = require('./routes/litigantRoutes'); // routes for litigants

const app = express();
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies



app.use(express.json()); // Parse JSON bodies

// Connect to database ejusticeBharat
connectDB();

// routes and middleware
app.use('/litigants', litigantRoutes); // Use litigant routes

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



