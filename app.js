const express = require('express');
const cors = require('cors');

const { connectDB, disconnectDB } = require('./config/db');
const litigantRoutes = require('./routes/litigantRoutes');
const advocateRoutes = require('./routes/advocateRoutes');
const otpRoutes = require('./routes/otpRoutes');
const meetingRoutes = require("./routes/meetingRoutes");
const caseRoutes = require('./routes/caseRoutes');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const caseRequestRoutes = require('./routes/caseRequestRoutes');
const globalErrorHandler = require('./middlewares/globalErrorHandler');

const app = express();
connectDB();

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const allowedOrigins = ['http://localhost:5173', 'https://e-justice-bharat.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204);
  }
  next();
});

// Apply CORS
app.use(cors(corsOptions));

// Routes
app.use('/litigants', litigantRoutes);
app.use('/advocates', advocateRoutes);
app.use('/email', otpRoutes);
app.use("/ejusticeBharat/meeting", meetingRoutes);
app.use('/cases', caseRoutes);
app.use('/auth', authRoutes);
app.use("/files", fileRoutes);
app.use("/request", caseRequestRoutes);

app.use(globalErrorHandler);
app.get('/', (req, res) => res.send('Welcome to eJustice Bharat'));


// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing MongoDB connection');
  await disconnectDB();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
