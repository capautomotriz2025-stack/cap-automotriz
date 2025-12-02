# 🌱 Instrucciones para Ejecutar Seeds

Este archivo contiene datos de ejemplo para poblar la base de datos con vacantes y candidatos.

## 📋 ¿Qué incluye el Seed?

### 10 Vacantes de Ejemplo:

1. **Desarrollador Full Stack Senior** (Publicada)
   - Stack: React, Node.js, TypeScript, MongoDB
   - Sueldo: $45,000 - $65,000 MXN

2. **Diseñador UX/UI** (Publicada)
   - Herramientas: Figma, Adobe XD
   - Sueldo: $30,000 - $45,000 MXN

3. **Gerente de Recursos Humanos** (Publicada)
   - 7 años de experiencia
   - Sueldo: $50,000 - $70,000 MXN

4. **Analista de Datos Junior** (Publicada)
   - Stack: Python, SQL, Excel
   - Sueldo: $18,000 - $25,000 MXN

5. **Marketing Digital Manager** (Publicada)
   - Especialidad: SEO, SEM, Social Media
   - Sueldo: $35,000 - $50,000 MXN

6. **Desarrollador Mobile** (Publicada)
   - Stack: React Native, Swift, Kotlin
   - Sueldo: $40,000 - $60,000 MXN

7. **Contador Público** (Borrador)
   - 3 años de experiencia
   - Sueldo: $25,000 - $35,000 MXN

8. **Ingeniero DevOps** (Publicada)
   - Stack: AWS, Docker, Kubernetes
   - Sueldo: $50,000 - $75,000 MXN

9. **Practicante de Ventas** (Publicada)
   - Estudiante o recién egresado
   - Sueldo: $8,000 - $12,000 MXN

10. **Product Manager** (Borrador)
    - 5 años de experiencia
    - Sueldo: $55,000 - $80,000 MXN

### 11 Candidatos de Ejemplo:

Los candidatos están distribuidos con diferentes:
- ✅ **Puntajes IA**: desde 65 hasta 95
- ✅ **Clasificaciones**: ideal, potencial, no perfila
- ✅ **Estados**: applied, screening, interview, evaluation, offer, rejected
- ✅ **Perfiles**: desde juniors hasta seniors en diferentes áreas

## 🚀 Cómo Ejecutar el Seed

### Opción 1: Con npm (Recomendada)

```bash
npm run seed
```

### Opción 2: Con tsx directamente

```bash
npx tsx scripts/seed.ts
```

### Opción 3: Desde Node (si tienes ts-node instalado)

```bash
npx ts-node scripts/seed.ts
```

## ⚠️ IMPORTANTE

**El seed limpiará todas las vacantes y candidatos existentes** antes de insertar los datos de ejemplo.

Si ya tienes datos en tu base de datos y no quieres perderlos, **NO ejecutes el seed**.

## 📊 Resultado del Seed

Después de ejecutar el seed, verás un resumen como este:

```
📊 RESUMEN DE SEED:
==================
✅ Vacantes creadas: 10
   - Publicadas: 8
   - Borradores: 2

✅ Candidatos creados: 11
   - Ideales: 7
   - Potenciales: 4
   - No perfiles: 0

🎯 Estados de candidatos:
   - Aplicados: 2
   - Screening: 2
   - Entrevista: 2
   - Evaluación: 2
   - Oferta: 1
   - Rechazados: 1
```

## 🎨 Casos de Uso Incluidos

El seed incluye diferentes escenarios para probar todas las funcionalidades:

### 1. **Candidatos Ideales** (Score 80-95)
- María González - Full Stack (92 puntos) → En entrevista
- Luis Hernández - RH (95 puntos) → En oferta
- Roberto Silva - Marketing (91 puntos) → En entrevista
- Miguel Ángel - DevOps (94 puntos) → En evaluación

### 2. **Candidatos Potenciales** (Score 50-79)
- Carlos Rodríguez - Full Stack (75 puntos) → En screening
- Patricia Ramírez - Datos (68 puntos) → Aplicada
- Daniela Morales - Ventas (72 puntos) → Aplicada
- Jorge Fernández - Product (65 puntos) → Rechazado

### 3. **Diferentes Áreas**
- Tecnología (Full Stack, Mobile, DevOps)
- Diseño (UX/UI)
- Recursos Humanos
- Análisis de Datos
- Marketing Digital
- Ventas
- Finanzas

### 4. **Diferentes Niveles**
- Seniors (5-8 años)
- Mid-level (3-4 años)
- Juniors (1-2 años)
- Practicantes (0 años)

## 🧪 Probar el Sistema

Después de ejecutar el seed, puedes:

1. **Ver el Dashboard**: http://localhost:3000/dashboard
   - Estadísticas generales
   - Vacantes y candidatos totales

2. **Gestionar Vacantes**: http://localhost:3000/dashboard/vacancies
   - 8 vacantes publicadas
   - 2 borradores para editar

3. **Ver Candidatos**: http://localhost:3000/dashboard/candidates
   - 11 candidatos con diferentes perfiles
   - Buscar por nombre o email

4. **Tablero Kanban**: http://localhost:3000/dashboard/kanban
   - Candidatos distribuidos en diferentes columnas
   - Probar drag & drop

5. **Formulario Público**: http://localhost:3000/apply/{vacancyId}
   - Probar postulación a cualquier vacante publicada
   - La IA analizará el CV automáticamente

## 🔄 Re-ejecutar el Seed

Puedes ejecutar el seed cuantas veces quieras para:
- Resetear la base de datos
- Volver al estado inicial
- Limpiar datos de prueba

Simplemente ejecuta de nuevo:

```bash
npm run seed
```

## ❓ Solución de Problemas

### Error: "Cannot connect to MongoDB"

Asegúrate de que MongoDB esté corriendo:

```bash
# Windows - Verificar servicio
net start MongoDB

# Conectar manualmente
mongosh
```

### Error: "Cannot find module"

Instala las dependencias:

```bash
npm install
```

### Error con TypeScript

Asegúrate de que `tsx` esté instalado:

```bash
npm install tsx --save-dev
```

## 💡 Personalizar el Seed

Puedes editar `scripts/seed.ts` para:
- Agregar más vacantes
- Modificar candidatos existentes
- Cambiar puntajes IA
- Agregar nuevos campos
- Crear diferentes escenarios

---

¡Disfruta probando el sistema con datos realistas! 🎉

