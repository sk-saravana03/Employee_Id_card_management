import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/enterprise_id_card_db');
    console.log(`[MongoDB] Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failure: ${error.message}`);
    // Non-fatal exit for resilient dev environment
  }
};

export default connectDB;
