# 📝 Sistema de Postulación de Candidatos

## ✅ **Sistema Completo y Funcional**

El sistema de postulación ya está completamente implementado y listo para usar.

---

## 🌐 **URLs Principales**

### **Para Candidatos:**

1. **Ver Todas las Vacantes**
   ```
   http://localhost:3000/vacancies
   ```
   - Lista de todas las vacantes publicadas
   - Búsqueda por puesto, departamento o ubicación
   - Cards con información completa de cada vacante

2. **Postularse a una Vacante**
   ```
   http://localhost:3000/apply/[vacancyId]
   ```
   - Formulario simple con 4 campos:
     - Nombre completo
     - Email
     - Teléfono
     - CV (PDF)

---

## 📋 **Formulario de Postulación**

### **Campos del Formulario:**
- ✅ **Nombre Completo** (texto, requerido)
- ✅ **Email** (email, requerido)
- ✅ **Teléfono** (texto, requerido)
- ✅ **CV** (archivo PDF, requerido, máx 10MB)

### **Proceso al Enviar:**

1. **Validación** del formulario
2. **Upload del CV** a `/public/uploads/cvs/`
3. **Análisis automático con IA (GPT-4)**:
   - Evalúa el CV vs descripción del puesto
   - Asigna puntaje del 1-100
   - Clasifica: "ideal", "potencial", "no perfila"
   - Genera justificación
4. **Guardado en MongoDB**
5. **Notificaciones automáticas**:
   - Email de confirmación al candidato
   - WhatsApp de confirmación (si configurado)
6. **Página de éxito** con mensaje de confirmación

---

## 🗄️ **Base de Datos**

### **Modelo: Candidate**

```typescript
{
  vacancyId: ObjectId,           // Referencia a la vacante
  fullName: string,              // Nombre completo
  email: string,                 // Email
  phone: string,                 // Teléfono
  cvUrl: string,                 // Ruta del CV guardado
  cvText: string,                // Texto extraído del CV
  
  // Análisis de IA
  aiScore: number,               // 1-100
  aiClassification: string,      // ideal | potencial | no perfila
  aiJustification: string,       // Razón de la clasificación
  
  status: string,                // applied | screening | interview | evaluation | offer | hired | rejected
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌱 **Datos de Ejemplo (Seed)**

El seed ya incluye **11 candidatos de ejemplo**:

```bash
npm run seed
```

Esto creará:
- ✅ 10 vacantes (8 publicadas)
- ✅ 11 candidatos con análisis IA completo
- ✅ Diferentes estados del pipeline
- ✅ Puntajes variados (65-95)
- ✅ Todas las clasificaciones

---

## 📂 **Directorios de Archivos**

Los CVs se guardan en:
```
public/uploads/cvs/
```

Ya está configurado con `.gitkeep` para mantener el directorio.

---

## 🔄 **Flujo Completo del Candidato**

### **Paso 1: Descubrir Vacantes**
- Entra a http://localhost:3000/vacancies
- Ve todas las vacantes publicadas
- Puede buscar por keywords
- Ve detalles: salario, ubicación, habilidades

### **Paso 2: Ver Detalles**
- Click en "Postularme Ahora"
- Ve descripción completa
- Ve habilidades requeridas
- Ve rango salarial

### **Paso 3: Llenar Formulario**
- Completa sus datos personales
- Sube su CV en PDF
- Click en "Enviar Aplicación"

### **Paso 4: IA Procesa**
- Sistema sube el CV
- GPT-4 analiza el CV vs vacante
- Asigna puntaje y clasificación
- Guarda en base de datos

### **Paso 5: Confirmación**
- Candidato ve página de éxito
- Recibe email de confirmación
- Recibe WhatsApp (si configurado)

### **Paso 6: Dashboard Admin**
- Admin ve el nuevo candidato en Dashboard
- Puede verlo en lista de Candidatos
- Puede arrastrarlo en el Kanban
- Ve su puntaje y clasificación IA

---

## 🎨 **Componentes UI Usados**

- ✅ Card (para vacantes y formulario)
- ✅ Input (para campos de texto)
- ✅ Label (para etiquetas)
- ✅ Button (para acciones)
- ✅ Badge (para estados)
- ✅ Todo con shadcn/ui

---

## 🚀 **Para Probar el Sistema**

### **1. Ver Vacantes Disponibles**
```
http://localhost:3000/vacancies
```

### **2. Escoger una Vacante y Postularse**
- Click en cualquier vacante
- Llena el formulario
- Sube un PDF cualquiera como CV
- Envía

### **3. Ver el Resultado en el Dashboard**
```
http://localhost:3000/dashboard/candidates
```

O en el Kanban:
```
http://localhost:3000/dashboard/kanban
```

---

## 📊 **APIs Involucradas**

### **GET /api/vacancies?status=published**
Obtiene todas las vacantes publicadas

### **GET /api/vacancies/[id]**
Obtiene detalles de una vacante específica

### **POST /api/applications**
Recibe el formulario de postulación:
- Valida campos
- Guarda CV
- Analiza con IA
- Crea candidato en DB
- Envía notificaciones

---

## ✨ **Características de IA**

Cuando un candidato se postula:

1. **GPT-4 analiza** el CV vs descripción del puesto
2. **Asigna puntaje** del 1-100 basado en:
   - Match de habilidades requeridas
   - Años de experiencia
   - Nivel educativo
   - Experiencia relevante
3. **Clasifica** automáticamente:
   - 🟢 **Ideal**: 80-100 puntos
   - 🟡 **Potencial**: 50-79 puntos
   - 🔴 **No Perfila**: 0-49 puntos
4. **Genera justificación** explicando la calificación

---

## 🔔 **Notificaciones Automáticas**

### **Email (si configurado):**
```
Asunto: Confirmación de postulación - [Nombre Vacante]

Hola [Nombre],

Hemos recibido tu aplicación para el puesto de [Vacante].
Nuestro equipo revisará tu CV y nos pondremos en contacto 
contigo pronto.

Saludos cordiales,
Equipo de Recursos Humanos
```

### **WhatsApp (si configurado con Twilio):**
```
Hola [Nombre]! 👋

Hemos recibido tu aplicación para el puesto de [Vacante].

Nuestro equipo revisará tu CV y te contactaremos pronto. ✅
```

---

## ✅ **Todo Está Listo**

El sistema de postulación está **100% funcional** con:

- ✅ Página de listado de vacantes
- ✅ Formulario de postulación
- ✅ Upload de archivos
- ✅ Análisis automático con IA
- ✅ Guardado en base de datos
- ✅ Notificaciones automáticas
- ✅ Integración con dashboard
- ✅ Datos de ejemplo en seed

¡Solo ejecuta `npm run seed` y prueba el sistema! 🚀

