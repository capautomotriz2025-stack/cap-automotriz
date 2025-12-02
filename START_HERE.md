# 🚀 EMPIEZA AQUÍ - Portal de Reclutamiento

## ⚡ Inicio Rápido (3 Pasos)

### 1️⃣ Instalar Dependencias

```bash
npm install
```

### 2️⃣ Poblar Base de Datos con Ejemplos

```bash
npm run seed
```

Este comando creará automáticamente:
- ✅ **10 vacantes** de ejemplo (Full Stack, UX/UI, Marketing, DevOps, etc.)
- ✅ **11 candidatos** con análisis de IA completos
- ✅ Diferentes estados en el pipeline de reclutamiento

### 3️⃣ Iniciar el Servidor

```bash
npm run dev
```

Abre: **http://localhost:3000**

---

## 🎯 ¿Qué Probar Primero?

### 1. **Dashboard Principal**
🔗 http://localhost:3000/dashboard

- Ver estadísticas generales
- Métricas de vacantes y candidatos
- Accesos rápidos

### 2. **Tablero Kanban** ⭐ (Lo Más Cool)
🔗 http://localhost:3000/dashboard/kanban

- Visualiza 11 candidatos reales
- Arrastra y suelta entre columnas
- Cambia estados en tiempo real
- Ve puntajes de IA de cada candidato

### 3. **Gestión de Vacantes**
🔗 http://localhost:3000/dashboard/vacancies

- 8 vacantes publicadas listas para probar
- Crea nuevas con optimización de IA
- Edita y publica vacantes

### 4. **Lista de Candidatos**
🔗 http://localhost:3000/dashboard/candidates

- 11 candidatos con diferentes perfiles
- Puntajes desde 65 hasta 95
- Búsqueda y filtros

### 5. **Formulario Público** (Prueba la Aplicación)
🔗 http://localhost:3000/apply/[vacancyId]

- Copia cualquier ID de vacante del dashboard
- Prueba el formulario de aplicación
- La IA analizará el CV automáticamente

---

## 📊 Datos de Ejemplo Incluidos

### Vacantes por Área:

- 💻 **Tecnología**: Full Stack, Mobile, DevOps
- 🎨 **Diseño**: UX/UI
- 👥 **RH**: Gerente de RH
- 📊 **Datos**: Analista de Datos
- 📢 **Marketing**: Marketing Digital Manager
- 💼 **Otros**: Ventas, Contabilidad, Product Manager

### Candidatos Destacados:

| Nombre | Puesto | Score IA | Estado |
|--------|--------|----------|--------|
| María González | Full Stack | 92 | Entrevista |
| Luis Hernández | RH | 95 | Oferta |
| Ana Martínez | UX/UI | 88 | Evaluación |
| Miguel Ángel | DevOps | 94 | Evaluación |
| Roberto Silva | Marketing | 91 | Entrevista |

---

## 🎨 Funcionalidades Principales a Probar

### 1. **Análisis Automático con IA**
- Cada candidato tiene un puntaje del 1-100
- Clasificación: Ideal, Potencial, No Perfila
- Justificación generada por IA

### 2. **Tablero Kanban Interactivo**
- Drag & Drop entre 7 columnas
- Estados: Aplicado → Screening → Entrevista → Evaluación → Oferta → Contratado/Rechazado
- Actualización automática en base de datos

### 3. **Optimización de Descripciones**
- Al crear/editar vacante, marca "Optimizar con IA"
- GPT-4 mejora la descripción automáticamente
- Genera perfiles de candidato ideales

### 4. **Generación de Ofertas**
- Usa la API para generar cartas de oferta
- Contenido profesional creado por IA
- Envío automático por email

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Base de Datos
npm run seed            # Poblar con datos de ejemplo (⚠️ borra datos existentes)

# Otros
npm run build           # Construir para producción
npm start              # Iniciar en modo producción
npm run lint           # Verificar código
```

---

## 📁 Archivos Importantes

- `README.md` - Documentación completa del proyecto
- `INSTALL.md` - Guía detallada de instalación
- `SEED_INSTRUCTIONS.md` - Detalles de los datos de ejemplo
- `.env.local` - Variables de entorno (API keys)

---

## 🔑 Configuración Actual

### MongoDB
```
URI: mongodb://localhost:27017/recruitment
Estado: ✅ Local (para desarrollo)
```

### OpenAI
```
API Key: ✅ Configurada
Modelo: GPT-4
```

### Email/WhatsApp
```
Estado: ⚠️ Opcional (configurar después)
```

---

## ❓ Problemas Comunes

### ❌ Error: "Cannot connect to MongoDB"

**Solución**: Verifica que MongoDB esté corriendo
```bash
mongosh  # Debe conectar sin errores
```

### ❌ Error: "Module not found"

**Solución**: Reinstala dependencias
```bash
npm install
```

### ❌ PowerShell no ejecuta comandos

**Solución**: Abre PowerShell como Administrador y ejecuta:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎓 Flujo de Trabajo Recomendado

1. ✅ **Explora el Dashboard** - Familiarízate con la interfaz
2. ✅ **Ve al Kanban** - Mueve candidatos entre columnas
3. ✅ **Crea una Vacante Nueva** - Usa la optimización con IA
4. ✅ **Prueba el Formulario Público** - Postúlate a una vacante
5. ✅ **Revisa el Análisis de IA** - Ve cómo se calificó el candidato
6. ✅ **Experimenta con las APIs** - Genera ofertas, envía notificaciones

---

## 🌟 Características Estrella

- 🤖 **Análisis Automático de CVs con GPT-4**
- 🎯 **Tablero Kanban Drag & Drop**
- ✍️ **Optimización de Descripciones con IA**
- 📧 **Notificaciones Email y WhatsApp**
- 📄 **Generación de Cartas de Oferta**
- 📊 **Dashboard con Estadísticas en Tiempo Real**

---

## 🚀 ¿Listo para Producción?

Cuando quieras desplegar:

1. Configura MongoDB Atlas (nube)
2. Actualiza `.env.local` con la URI de Atlas
3. Configura Email (Gmail) y WhatsApp (Twilio)
4. Despliega en Vercel, Railway o tu plataforma favorita

---

## 💬 ¿Necesitas Ayuda?

1. Revisa `README.md` para documentación completa
2. Revisa `INSTALL.md` para problemas de instalación
3. Verifica la consola del navegador para errores
4. Revisa los logs del servidor en tu terminal

---

## ✨ ¡A Reclutar con IA!

El sistema está completamente funcional y listo para usar. 

**Siguiente paso**: Ejecuta `npm run seed` y explora el dashboard.

¡Éxito! 🎉

