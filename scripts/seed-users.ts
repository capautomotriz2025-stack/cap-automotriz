import mongoose from 'mongoose';

async function connectDB() {
  try {
    await mongoose.connect(
      'mongodb+srv://Vercel-Admin-capbd:Kw2XdeEzRqlE5ieO@capbd.y47hemp.mongodb.net/recruitment?retryWrites=true&w=majority'
    );
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error);
    process.exit(1);
  }
}

export default connectDB;
