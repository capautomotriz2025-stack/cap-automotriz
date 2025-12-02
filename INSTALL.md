# 🚀 Guía de Instalación Rápida

## Paso 1: Habilitar Scripts en PowerShell

Abre PowerShell **como Administrador** y ejecuta:

\`\`\`powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
\`\`\`

Confirma con "S" o "Y".

## Paso 2: Instalar Dependencias

En tu terminal normal (PowerShell o CMD), dentro de la carpeta del proyecto:

\`\`\`bash
npm install
\`\`\`

Este proceso puede tardar 2-5 minutos. Espera a que termine completamente.

## Paso 3: Verificar MongoDB

### Opción A: MongoDB Local (Para desarrollo)

1. **Descargar MongoDB Community Server**
   - Ve a: https://www.mongodb.com/try/download/community
   - Descarga la versión para Windows
   - Instala con opciones por defecto
   - MongoDB se ejecutará automáticamente

2. **Verificar que funciona**
   
   Abre una nueva terminal y ejecuta:
   
   \`\`\`bash
   mongosh
   \`\`\`
   
   Si ves algo como "Connected to MongoDB", ¡funciona!

### Opción B: MongoDB Atlas (Para producción)

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un cluster (tier gratuito)
4. Obtén la URI de conexión
5. Actualiza `.env.local`:

\`\`\`env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/recruitment
\`\`\`

## Paso 4: Poblar Base de Datos (Recomendado)

**¡IMPORTANTE!** Para ver el sistema con datos de ejemplo, ejecuta:

\`\`\`bash
npm run seed
\`\`\`

Esto creará:
- ✅ 10 vacantes de ejemplo (diferentes áreas y niveles)
- ✅ 11 candidatos con puntajes IA reales
- ✅ Casos de uso completos para probar todas las funciones

**Nota**: El seed eliminará datos existentes. Si ya tienes información, no lo ejecutes.

## Paso 5: Ejecutar el Proyecto

\`\`\`bash
npm run dev
\`\`\`

Abre tu navegador en: **http://localhost:3000**

## ✅ ¡Listo!

Ahora puedes:

1. **Crear tu primera vacante** en Dashboard → Vacantes
2. **Probar el formulario público** en `/apply/{vacancyId}`
3. **Ver el tablero Kanban** en Dashboard → Kanban

## 🆘 ¿Problemas?

### Error: "npm no se reconoce..."

Instala Node.js desde: https://nodejs.org

### Error: "Cannot connect to MongoDB"

- Verifica que MongoDB esté corriendo
- En Windows: Abre "Servicios" y busca "MongoDB Server"
- Debe estar en estado "En ejecución"

### Error en npm install

Intenta:

\`\`\`bash
npm cache clean --force
npm install
\`\`\`

### La aplicación no carga

1. Verifica que no haya errores en la terminal
2. Asegúrate de que el puerto 3000 esté libre
3. Revisa que `.env.local` exista y tenga las variables correctas

## 📧 Configuración Opcional

### Gmail (Para notificaciones)

1. Activa verificación en 2 pasos
2. Genera contraseña de aplicación: https://myaccount.google.com/apppasswords
3. Actualiza `.env.local`

### WhatsApp (Twilio)

1. Crea cuenta en https://www.twilio.com/
2. Activa WhatsApp Sandbox
3. Actualiza `.env.local`

---

**¿Todo listo?** ¡Comienza a crear vacantes y automatiza tu reclutamiento! 🎉

