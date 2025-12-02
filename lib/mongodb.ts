import mongoose from 'mongoose';
import { setMockDataMode } from './mock-data';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitment';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
  var mongoDBAvailable: boolean | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

if (global.mongoDBAvailable === undefined) {
  global.mongoDBAvailable = true;
}

async function connectDB() {
  // Si ya sabemos que MongoDB no está disponible, no intentar conectar
  if (global.mongoDBAvailable === false) {
    setMockDataMode(true);
    console.log('⚠️  Usando datos mock (MongoDB no disponible)');
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout más rápido
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        global.mongoDBAvailable = true;
        setMockDataMode(false);
        console.log('✅ MongoDB conectado');
        return mongoose;
      })
      .catch((error) => {
        global.mongoDBAvailable = false;
        setMockDataMode(true);
        console.log('⚠️  MongoDB no disponible, usando datos mock:', error.message);
        cached.promise = null;
        return null as any;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    global.mongoDBAvailable = false;
    setMockDataMode(true);
    console.log('⚠️  Error conectando a MongoDB, usando datos mock');
  }

  return cached.conn;
}

export function isMongoDBAvailable() {
  return global.mongoDBAvailable !== false;
}

export default connectDB;

