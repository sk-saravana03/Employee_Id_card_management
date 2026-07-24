import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.config.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` ENTERPRISE ID CARD MANAGEMENT API RUNNING`);
    console.log(` Port: ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` System Time: ${new Date().toISOString()}`);
    console.log(`=======================================================`);
  });
});
