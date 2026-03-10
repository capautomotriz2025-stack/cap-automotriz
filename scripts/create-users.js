const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Load env
fs.readFileSync('.env', 'utf-8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#') && t.includes('=')) {
    const [k, ...v] = t.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  }
});

const users = [
  { email: 'gerencia@cap.hn',  name: 'Gerencia CAP',  role: 'superadmin', password: 'Gerencia2024!' },
  { email: 'rrhh@cap.hn',      name: 'RRHH CAP',      role: 'admin',      password: 'Rrhh2024!'     },
  { email: 'manager@cap.hn',   name: 'Manager CAP',   role: 'manager',    password: 'Manager2024!'  },
  { email: 'usuario@cap.hn',   name: 'Usuario CAP',   role: 'user',       password: 'Usuario2024!'  },
];

async function main() {
  await mongoose.connect(process.env.BD_MONGODB_URI);
  const col = mongoose.connection.db.collection('users');

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    const exists = await col.findOne({ email: u.email });
    await col.updateOne(
      { email: u.email },
      { $set: { password: hashed, name: u.name, role: u.role, active: true, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    console.log('✅', u.role.padEnd(12), u.email, '| active: true');
  }

  await mongoose.connection.close();
  console.log('\nListo.');
}

main().catch(e => { console.error(e); process.exit(1); });
