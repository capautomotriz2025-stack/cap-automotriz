# 🔐 Sistema de Autenticación y Roles

Sistema completo de autenticación con JWT usando NextAuth.js.

---

## ✅ Características Implementadas

### 🔑 Autenticación
- ✅ Login con email y contraseña
- ✅ JWT (JSON Web Tokens) para sesiones
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Protección de rutas del dashboard
- ✅ Sesión persistente (30 días)

### 👥 Sistema de Roles
- 🟣 **Superadmin**: Acceso total + gestión de usuarios
- 🔵 **Admin**: Acceso al dashboard (futuro)
- ⚪ **User**: Acceso básico (futuro)

### 🛡️ Superadmins Predefinidos
1. **luciano.mastran@gmail.com** (Luciano Mastrangelo)
2. **gerencia@cap.hn** (Gerencia CAP)

---

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Agrega en tu archivo `.env`:

```bash
# NextAuth Secret (REQUERIDO)
# Genera uno con: openssl rand -base64 32
NEXTAUTH_SECRET=tu-secret-super-secreto-aqui

# MongoDB (REQUERIDO para autenticación)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/recruitment

# Las demás variables que ya tienes...
OPENAI_API_KEY=sk-proj-...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### 2. Instalar Dependencias

**En desarrollo local:**
```bash
npm install
```

Las nuevas dependencias son:
- `next-auth` - Sistema de autenticación
- `bcryptjs` - Hash de contraseñas
- `@types/bcryptjs` - Tipos TypeScript

### 3. Crear Superadmins

**Ejecuta el script de seed:**

```bash
npm run seed-users
```

Esto creará los 2 superadmins con credenciales temporales:

```
📧 luciano.mastran@gmail.com
🔑 Admin2024!

📧 gerencia@cap.hn  
🔑 Gerencia2024!
```

⚠️ **IMPORTANTE**: Cambia estas contraseñas al primer login.

---

## 🔐 Cómo Usar el Sistema

### 1. Acceder al Dashboard

Ahora el dashboard está protegido. Si intentas ir a `/dashboard` sin login, te redirige a `/login`.

```
https://tu-app.com/dashboard → Redirige a /login
```

### 2. Iniciar Sesión

1. Ve a: `https://tu-app.com/login`
2. Ingresa email y contraseña
3. Click en "Iniciar Sesión"
4. Serás redirigido al dashboard

### 3. Gestionar Usuarios (Solo Superadmins)

Los superadmins ven un nuevo menú **"Usuarios"** en el sidebar.

**Acceso directo:**
```
https://tu-app.com/dashboard/users
```

**Funciones disponibles:**
- ✅ Ver todos los usuarios
- ✅ Crear nuevos usuarios
- ✅ Editar usuarios existentes
- ✅ Desactivar usuarios
- ✅ Eliminar usuarios (excepto superadmins protegidos)
- ✅ Cambiar roles

### 4. Cerrar Sesión

Click en el botón "Cerrar Sesión" en el footer del sidebar.

---

## 🎯 Roles y Permisos

| Característica | Superadmin | Admin | User |
|----------------|:----------:|:-----:|:----:|
| Acceso al Dashboard | ✅ | ✅ | ✅ |
| Ver Vacantes | ✅ | ✅ | ✅ |
| Crear Vacantes | ✅ | ✅ | ✅ |
| Ver Candidatos | ✅ | ✅ | ✅ |
| Kanban | ✅ | ✅ | ✅ |
| Agentes IA | ✅ | ✅ | ✅ |
| **Gestionar Usuarios** | ✅ | ❌ | ❌ |
| **Eliminar Superadmins** | ❌ | ❌ | ❌ |

---

## 🛡️ Protección de Superadmins

Los 2 superadmins predefinidos **NO pueden ser eliminados**:
- luciano.mastran@gmail.com
- gerencia@cap.hn

Si intentas eliminarlos desde la UI, recibirás un error:
```
❌ No se puede eliminar este superadmin
```

---

## 🔧 Crear Nuevos Usuarios

### Desde la UI (Recomendado)

1. Login como superadmin
2. Ve a `/dashboard/users`
3. Click en "Nuevo Usuario"
4. Llena el formulario:
   - Nombre
   - Email
   - Contraseña (mínimo 6 caracteres)
   - Rol (user/admin/superadmin)
   - Estado (activo/inactivo)
5. Click en "Crear"

### Desde API

```bash
POST /api/users

{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "password123",
  "role": "user"
}

# Header requerido:
Authorization: Bearer <session-token>
Role: superadmin
```

---

## 🔄 Editar Usuarios

### Cambiar Contraseña

1. Ve a `/dashboard/users`
2. Click en el botón "Editar" del usuario
3. Ingresa nueva contraseña (o déjala en blanco para mantener)
4. Click en "Actualizar"

### Cambiar Rol

1. Ve a `/dashboard/users`
2. Click en "Editar"
3. Selecciona nuevo rol del dropdown
4. Click en "Actualizar"

### Desactivar Usuario

1. Ve a `/dashboard/users`
2. Click en "Editar"
3. Desmarca "Usuario activo"
4. Click en "Actualizar"

Un usuario inactivo no puede hacer login.

---

## 🚀 Deployment en Vercel

### Variables de Entorno en Vercel

En tu proyecto de Vercel → Settings → Environment Variables:

```bash
# REQUERIDO
NEXTAUTH_SECRET=tu-secret-generado-con-openssl

# URL de la app (Vercel lo detecta automático, pero puedes especificar)
NEXTAUTH_URL=https://tu-app.vercel.app

# MongoDB (REQUERIDO)
MONGODB_URI=mongodb+srv://...

# Las demás que ya tienes
OPENAI_API_KEY=sk-proj-...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### Generar NEXTAUTH_SECRET

**En tu terminal local:**
```bash
openssl rand -base64 32
```

Copia el output y úsalo como `NEXTAUTH_SECRET`.

### Seed en Producción

**Opción A: Desde tu local (conectado a MongoDB de producción)**
```bash
MONGODB_URI="mongodb+srv://prod..." npm run seed-users
```

**Opción B: Desde Vercel CLI**
```bash
vercel env pull .env.production
npm run seed-users
```

---

## 🔒 Seguridad

### ✅ Implementado

- ✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)
- ✅ JWT con expiración de 30 días
- ✅ Middleware protegiendo rutas del dashboard
- ✅ Validación de roles en API routes
- ✅ Passwords no se retornan en queries (select: false)
- ✅ HTTPS requerido en producción
- ✅ Superadmins protegidos contra eliminación

### 🔐 Mejores Prácticas

1. **Cambia las contraseñas predefinidas** al primer login
2. **Usa contraseñas fuertes** (mínimo 8 caracteres, mayúsculas, números, símbolos)
3. **Genera NEXTAUTH_SECRET único** para cada ambiente
4. **No compartas** el NEXTAUTH_SECRET
5. **Revisa usuarios** regularmente y desactiva los que no se usen

---

## 🧪 Testing

### Probar Login Local

1. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Crea los superadmins:**
   ```bash
   npm run seed-users
   ```

3. **Prueba el login:**
   - Ve a: http://localhost:3000/login
   - Email: `luciano.mastran@gmail.com`
   - Password: `Admin2024!`
   - Click "Iniciar Sesión"

4. **Verifica acceso:**
   - Deberías estar en el dashboard
   - Deberías ver "Usuarios" en el menú
   - Tu nombre debería aparecer en el footer

---

## ❓ Troubleshooting

### Error: "Base de datos no disponible"
- ✅ Verifica que `MONGODB_URI` esté configurado
- ✅ Verifica que MongoDB Atlas permita tu IP
- ✅ Verifica las credenciales en la connection string

### Error: "Usuario no encontrado"
- ✅ Ejecuta `npm run seed-users` para crear superadmins
- ✅ Verifica el email (case-sensitive)

### Error: "Contraseña incorrecta"
- ✅ Verifica la contraseña (case-sensitive)
- ✅ Usa las contraseñas predefinidas: `Admin2024!` o `Gerencia2024!`

### No veo el menú "Usuarios"
- ✅ Verifica que hayas iniciado sesión como superadmin
- ✅ Verifica en el footer que diga "Superadmin"
- ✅ Refresca la página

### Redirige a /login constantemente
- ✅ Limpia las cookies del navegador
- ✅ Verifica que `NEXTAUTH_SECRET` esté configurado
- ✅ Verifica que MongoDB esté funcionando

---

## 📝 Arquitectura

### Flujo de Autenticación

```
1. Usuario ingresa email/password en /login
   ↓
2. NextAuth valida contra MongoDB
   ↓
3. Busca user en DB, verifica password con bcrypt
   ↓
4. Si es válido, crea JWT token
   ↓
5. Token se guarda en cookie httpOnly
   ↓
6. Usuario redirigido a /dashboard
   ↓
7. Middleware verifica token en cada request
```

### Archivos Importantes

```
models/User.ts              - Modelo de usuario con hash
lib/auth.ts                 - Configuración de NextAuth
app/api/auth/[...nextauth]/ - Rutas de NextAuth
middleware.ts               - Protección de rutas
app/login/page.tsx          - Página de login
app/dashboard/users/        - Gestión de usuarios
app/api/users/              - API CRUD de usuarios
```

---

## 🎯 Próximos Pasos (Opcional)

1. **Email de verificación** al crear usuarios
2. **Recuperación de contraseña** por email
3. **2FA (Two-Factor Authentication)**
4. **Auditoría de logs** (quién modificó qué)
5. **Permisos granulares** por módulo
6. **OAuth** (Google, GitHub)

---

## ✅ Resumen

- ✅ Sistema de autenticación completo con JWT
- ✅ 3 roles: superadmin, admin, user
- ✅ 2 superadmins predefinidos
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Protección de rutas
- ✅ Contraseñas seguras (bcrypt)
- ✅ UI completa para todo

**¿Listo para usar!** 🚀

