import mongoose from 'mongoose';
import { setMockDataMode } from './mock-data';

// Usar BD_MONGODB_URI si existe, sino MONGODB_URI, sino local por defecto
const MONGODB_URI = process.env.BD_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitment';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}


// Evitar redeclaración de variables globales en entornos de recarga (Next.js)
declare global {
  // @ts-ignore
  var mongoose: MongooseCache | undefined;
  // @ts-ignore
  var mongoDBAvailable: boolean | undefined;
}


// Declarar variables globales de forma segura para evitar errores de recarga en Next.js
type GlobalWithMongoose = typeof globalThis & {
  mongoose?: MongooseCache;
  mongoDBAvailable?: boolean;
};
const g = global as GlobalWithMongoose;

if (!g.mongoose) {
  g.mongoose = { conn: null, promise: null };
}
if (g.mongoDBAvailable === undefined) {
  g.mongoDBAvailable = true;
}
let cached: MongooseCache = g.mongoose;

async function connectDB() {
  // Si ya sabemos que MongoDB no está disponible, no intentar conectar
  if ((global as any).mongoDBAvailable === false) {
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
        (global as any).mongoDBAvailable = true;
        setMockDataMode(false);
        console.log('✅ MongoDB conectado');
        console.log('📊 Base de datos:', mongoose.connection.db?.databaseName || 'No especificada');
        console.log('🔗 Host:', mongoose.connection.host || 'N/A');
        console.log('📡 URI (oculta):', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
        return mongoose;
      })
      .catch((error) => {
        (global as any).mongoDBAvailable = false;
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
    (global as any).mongoDBAvailable = false;
    setMockDataMode(true);
    console.log('⚠️  Error conectando a MongoDB, usando datos mock');
  }

  return cached.conn;
}

export function isMongoDBAvailable() {
  return (global as any).mongoDBAvailable !== false;
}

export default connectDB;

