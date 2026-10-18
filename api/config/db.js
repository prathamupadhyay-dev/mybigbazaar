/**
 * @file apps/api/config/db.js
 * @description Resilient MongoDB connection manager with Atlas DNS SRV support
 */

import mongoose from 'mongoose';
import dns from 'dns';
import colors from 'colors';
import env from './env.js';

// Configure public DNS resolvers to prevent Windows SRV lookup failures on Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
} catch (dnsErr) {
  console.warn('[DB] Could not set custom DNS servers:', dnsErr.message);
}

let isConnected = false;

export const connectDB = async (customUri = null) => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const uri = customUri || env.MONGO_URI;
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true
    });

    isConnected = true;
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`.green);

    mongoose.connection.on('error', (err) => {
      console.error('[DB] MongoDB runtime error:'.red, err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB connection lost. Reconnecting...'.yellow);
      isConnected = false;
    });

    return conn;
  } catch (error) {
    console.error(`[DB] MongoDB Connection Error: ${error.message}`.red);
    // In local dev without local/remote Mongo, don't crash the server process immediately
    // Allow server to run with mock / offline state if necessary
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

export const closeDB = async () => {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('[DB] MongoDB connection closed.'.yellow);
  }
};

export default connectDB;
