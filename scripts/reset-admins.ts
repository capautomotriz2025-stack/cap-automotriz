
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
let User: any;
try {
  // Si se ejecuta con ts-node, usar importación dinámica
  User = require('../models/User').default || require('../models/User');
} catch (e) {
  console.error('No se pudo importar el modelo User. Ejecuta este script con ts-node: npx ts-node scripts/reset-admins.ts');
  process.exit(1);
}

const MONGODB_URI = process.env.BD_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/recruitment';

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Conectado a MongoDB');

  // Resetear admin principal
  const admin = await User.findOneAndUpdate(
    { email: 'gerencia@cap.hn' },
    {
      password: 'Gerencia2024!', // El modelo hará hash automáticamente
      active: true,
      role: 'superadmin',
      name: 'Gerencia',
    },
    { new: true }
  );
  if (admin) {
    console.log('🔑 Admin actualizado:', admin.email);
  } else {
    console.log('⚠️  Admin no encontrado, creando uno nuevo...');
    await User.create({
      email: 'gerencia@cap.hn',
      password: 'Gerencia2024!',
      active: true,
      role: 'superadmin',
      name: 'Gerencia',
    });
    console.log('✅ Admin creado');
  }

  // Crear admin2
  const admin2 = await User.findOne({ email: 'admin2@cap.hn' });
  if (!admin2) {
    await User.create({
      email: 'admin2@cap.hn',
      password: 'Admin22024!',
      active: true,
      role: 'admin',
      name: 'Admin2',
    });
    console.log('✅ Admin2 creado');
  } else {
    console.log('ℹ️  Admin2 ya existe');
  }

  await mongoose.disconnect();
  console.log('🚪 Desconectado de MongoDB');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
