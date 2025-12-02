# 🚀 Configuración de Vercel

Esta guía te ayudará a configurar tu aplicación para producción en Vercel.

---

## 📦 1. Vercel Blob Storage (Almacenamiento de CVs)

Los CVs de los candidatos se guardan en **Vercel Blob** (almacenamiento en la nube).

### ✅ Pasos para Configurar

1. **Ve a tu proyecto en Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Storage → Create Database → Blob**
   - Click en "Storage" en el menú lateral
   - Click en "Create Database"
   - Selecciona "Blob" (almacenamiento de archivos)
   - Click en "Create"

3. **Vercel crea automáticamente la variable**
   - `BLOB_READ_WRITE_TOKEN` se agrega automáticamente
   - No necesitas copiar/pegar nada ✅

### 📊 Free Tier de Vercel Blob

- ✅ **500 MB** de almacenamiento
- ✅ **50,000 reads** por mes
- ✅ **5,000 writes** por mes
- ✅ **Gratis para siempre**

**Capacidad:** ~500-1000 CVs (dependiendo del tamaño)

---

## 🗄️ 2. MongoDB Atlas (Base de Datos)

Tu aplicación necesita MongoDB para guardar candidatos, vacantes y agentes de IA.

### ✅ Pasos para Configurar

1. **Crear cuenta en MongoDB Atlas**
   - Ve a: https://www.mongodb.com/cloud/atlas/register
   - Regístrate gratis

2. **Crear un Cluster Gratuito**
   - Click en "Build a Database"
   - Selecciona **M0 (Free)**
   - Elige región más cercana (ej: AWS - Virginia)
   - Click en "Create"

3. **Crear Database User**
   - Ve a "Database Access"
   - Click "Add New Database User"
   - Username: `recruitment_user` (o el que prefieras)
   - Password: Genera una contraseña segura (guárdala)
   - Rol: "Atlas Admin"
   - Click "Add User"

4. **Whitelist IP (Permitir Vercel)**
   - Ve a "Network Access"
   - Click "Add IP Address"
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Click "Confirm"

5. **Obtener Connection String**
   - Ve a "Database" → Click en "Connect"
   - Selecciona "Connect your application"
   - Copia la connection string:
   ```
   mongodb+srv://recruitment_user:<password>@cluster0.xxxxx.mongodb.net/
   ```
   - Reemplaza `<password>` con tu contraseña real
   - Agrega el nombre de la DB al final: `/recruitment`
   
   Ejemplo final:
   ```
   mongodb+srv://recruitment_user:MiPassword123@cluster0.xxxxx.mongodb.net/recruitment
   ```

6. **Agregar en Vercel**
   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Agrega:
     ```
     MONGODB_URI=mongodb+srv://recruitment_user:password@cluster.mongodb.net/recruitment
     ```

### 📊 Free Tier de MongoDB Atlas

- ✅ **512 MB** de almacenamiento
- ✅ **500 connections** simultáneas
- ✅ **Gratis para siempre**

**Capacidad:** ~10,000 - 50,000 registros de candidatos

---

## 🤖 3. OpenAI API (Análisis de CVs con IA)

Para que el sistema analice automáticamente los CVs necesitas una API Key de OpenAI.

### ✅ Pasos para Configurar

1. **Crear cuenta en OpenAI**
   - Ve a: https://platform.openai.com/signup

2. **Agregar créditos**
   - Ve a: https://platform.openai.com/account/billing
   - Agrega al menos $5 USD
   - **Costo estimado:** $0.02 - $0.05 por análisis de CV

3. **Crear API Key**
   - Ve a: https://platform.openai.com/api-keys
   - Click en "Create new secret key"
   - Copia la key (empieza con `sk-proj-...`)

4. **Agregar en Vercel**
   - Settings → Environment Variables
   - Agrega:
     ```
     OPENAI_API_KEY=sk-proj-tu-api-key-aqui
     ```

### 💰 Costos Estimados

- **Análisis de CV:** ~$0.02 - $0.05 por candidato
- **100 postulaciones/mes:** ~$2 - $5 USD/mes
- **1000 postulaciones/mes:** ~$20 - $50 USD/mes

---

## 📋 Resumen de Variables de Entorno en Vercel

En **Settings → Environment Variables**, necesitas:

### ✅ Obligatorias (Producción)

```bash
# Blob Storage (se crea automático al crear Blob en Vercel)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# MongoDB Atlas (la creas tú)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/recruitment

# OpenAI (la creas tú)
OPENAI_API_KEY=sk-proj-...
```

### 🔧 Opcionales (Notificaciones)

```bash
# Email (opcional - para enviar confirmaciones)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password

# WhatsApp vía Twilio (opcional)
TWILIO_ACCOUNT_SID=tu-account-sid
TWILIO_AUTH_TOKEN=tu-auth-token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

---

## 🧪 Cómo Probar que Todo Funciona

1. **Deploy en Vercel**
   ```bash
   git push origin main
   ```
   - Vercel hace deploy automático

2. **Visita tu app**
   - `https://tu-proyecto.vercel.app`

3. **Prueba postular a una vacante**
   - Ve a `/vacancies`
   - Selecciona una vacante
   - Sube tu CV
   - Deberías ver:
     - ✅ Loading spinner mientras analiza
     - ✅ CV se sube a Blob Storage
     - ✅ GPT-4 analiza el CV
     - ✅ Candidato se guarda en MongoDB
     - ✅ Éxito!

4. **Verificar en Logs**
   - Vercel Dashboard → Deployments → View Function Logs
   - Deberías ver:
     ```
     ☁️  Subiendo CV a Vercel Blob: 1234567890-cv.pdf
     ✅ CV subido a Blob: https://...blob.vercel-storage.com/cvs/...
     📄 Extrayendo texto del PDF
     ✅ Texto extraído: 3102 caracteres
     🤖 Análisis IA completado - Score: 85 Clasificación: ideal
     ✅ Candidato creado en DB
     ```

---

## ❓ Troubleshooting

### Error: "EROFS: read-only file system"
- ✅ **Solucionado** - Ahora usa Vercel Blob
- Asegúrate de tener Blob Storage creado

### Error: "MongoDB no disponible"
- ❌ Falta configurar `MONGODB_URI`
- Sigue los pasos de MongoDB Atlas arriba

### Error: "OpenAI API no configurada"
- ⚠️ El análisis usará un fallback genérico
- Configura `OPENAI_API_KEY` para análisis real con IA

### CVs no se suben
- Verifica que `BLOB_READ_WRITE_TOKEN` exista en variables de entorno
- Ve a Storage en Vercel y confirma que Blob esté creado

---

## 💰 Costos Totales Estimados

### 🆓 Free Forever
- **Vercel Hosting:** Gratis (hasta 100GB bandwidth)
- **Vercel Blob:** Gratis (500 MB)
- **MongoDB Atlas:** Gratis (512 MB)

### 💵 De Pago (Opcional)
- **OpenAI API:** ~$2-50/mes (depende de uso)
- **Email/WhatsApp:** $0-10/mes (si usas servicios)

**Total mínimo:** $0/mes ✅ (sin IA)  
**Total con IA:** $2-50/mes (según volumen)

---

## ✅ ¡Listo!

Tu aplicación ahora está configurada para producción en Vercel con:
- ☁️ Almacenamiento de CVs en la nube (Vercel Blob)
- 🗄️ Base de datos persistente (MongoDB Atlas)
- 🤖 Análisis inteligente con IA (OpenAI GPT-4)
- 🚀 Deploy automático desde GitHub

**¿Preguntas?** Revisa los logs en Vercel Dashboard para depurar cualquier error.

