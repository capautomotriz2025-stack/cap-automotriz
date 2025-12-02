# 🚀 Setup Rápido - RecruiterAI

## Paso 1: Crear archivo `.env.local`

Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# OpenAI API Configuration (REQUERIDO para funciones de IA)
OPENAI_API_KEY=sk-proj-TU_API_KEY_AQUI

# MongoDB Configuration (OPCIONAL - sin esto usa datos mock)
# MONGODB_URI=mongodb://localhost:27017/recruitment
```

**IMPORTANTE**: El archivo `.env.local` NO se sube a GitHub (está en `.gitignore`)

## Paso 2: Instalar dependencias

```bash
npm install
```

## Paso 3: Hacer el build

```bash
npm run build
```

## Paso 4: Iniciar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ℹ️ Notas Importantes

### Modo Mock vs MongoDB

- **Sin `MONGODB_URI`**: La aplicación usa datos mock (10 vacantes + 11 candidatos)
- **Con `MONGODB_URI`**: Se conecta a MongoDB (local o Atlas)

### Funciones de IA

- **Sin `OPENAI_API_KEY`**: Las funciones de IA no estarán disponibles
- **Con `OPENAI_API_KEY`**: Optimización de descripciones y análisis de CVs funcionan

### Notificaciones (Opcional)

Si quieres habilitar notificaciones por email/WhatsApp, agrega:

```env
# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=tu-account-sid
TWILIO_AUTH_TOKEN=tu-auth-token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

---

## ⚠️ IMPORTANTE: Tu API Key

**NO compartas tu API key de OpenAI públicamente.**

Cuando crees tu `.env.local`, usa TU propia API key de OpenAI.
Obtén una en: https://platform.openai.com/api-keys

## 🐛 Solución de Problemas

### Error: "username is required"
- Asegúrate de tener el archivo `.env.local` creado con la API key

### Build falla
- Verifica que `.env.local` existe en la raíz del proyecto
- Ejecuta `npm install` de nuevo

### MongoDB no conecta
- No te preocupes, la app usará datos mock automáticamente
- Los datos mock son suficientes para demos y desarrollo

---

## 📦 Para Vercel

Cuando subas a Vercel, agrega estas variables de entorno en el dashboard:

1. `OPENAI_API_KEY` (opcional pero recomendado)
2. `MONGODB_URI` (opcional - sin esto usa mock data)

¡Listo! 🎉

