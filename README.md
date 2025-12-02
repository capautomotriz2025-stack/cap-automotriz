# RecruiterAI 🤖

Portal de reclutamiento automatizado con Inteligencia Artificial para encontrar y gestionar el mejor talento.

## 🚀 Características

- ✅ **Gestión de Vacantes**: Crea, edita y publica vacantes de empleo
- 🤖 **Optimización con IA**: OpenAI optimiza descripciones de puestos
- 📄 **Análisis de CVs**: IA analiza candidatos y asigna puntuación (1-100)
- 📊 **Dashboard Kanban**: Visualiza el proceso de reclutamiento
- 📝 **Formulario de Aplicación**: Simple y efectivo (nombre, email, teléfono, CV)
- 🎯 **Clasificación de Candidatos**: Ideal, Potencial, No Perfila
- 📧 **Notificaciones**: Email y WhatsApp
- 💼 **Cartas de Oferta**: Generación automática con IA
- 🎨 **UI Moderna**: Diseñada con Tailwind CSS y Shadcn UI

## 🛠️ Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Base de Datos**: MongoDB con Mongoose
- **IA**: OpenAI GPT-4
- **Estilos**: Tailwind CSS
- **Componentes**: Shadcn UI
- **Notificaciones**: Nodemailer (Email) y Twilio (WhatsApp)

## 📦 Instalación

1. **Clona el repositorio**
```bash
git clone https://github.com/luciannomas/recruterAI.git
cd recruterAI
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
OPENAI_API_KEY=tu-api-key-de-openai
```

**⚠️ IMPORTANTE**: El proyecto funciona de dos formas:

### Modo 1: Con MongoDB (Recomendado para desarrollo/producción)
Si tienes MongoDB disponible, configura la URI:
```env
MONGODB_URI=mongodb://localhost:27017/recruitment
# o tu URI de MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/recruitment
```

Luego carga datos de prueba:
```bash
npm run seed
```

### Modo 2: Sin MongoDB (Mock Data)
Si **NO** tienes MongoDB instalado, la aplicación automáticamente usará datos mock:
- ✅ No requiere configuración adicional
- ✅ Funciona inmediatamente después de `npm install`
- ✅ Datos de ejemplo precargados (10 vacantes + 11 candidatos)
- ✅ Ideal para demos y despliegues rápidos en Vercel
- ⚠️ Los datos son volátiles (se pierden al reiniciar)

4. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

5. **Abre el navegador**
```
http://localhost:3000
```

La aplicación detectará automáticamente si MongoDB está disponible y usará mock data como fallback.

## 📁 Estructura del Proyecto

```
recruitment/
├── app/
│   ├── api/              # API Routes
│   ├── apply/            # Formulario público de aplicación
│   ├── dashboard/        # Panel administrativo
│   ├── vacancies/        # Lista pública de vacantes
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # Componentes Shadcn UI
│   └── kanban/           # Componentes del tablero Kanban
├── lib/
│   ├── mongodb.ts        # Conexión a MongoDB
│   ├── openai.ts         # Integración con OpenAI
│   └── utils.ts          # Utilidades
├── models/
│   ├── Vacancy.ts        # Modelo de Vacantes
│   └── Candidate.ts      # Modelo de Candidatos
├── scripts/
│   └── seed.ts           # Script de datos de prueba
└── public/
    └── uploads/          # Almacenamiento de archivos
```

## 🔑 API Routes

- `GET/POST /api/vacancies` - Listar y crear vacantes
- `GET/PUT/DELETE /api/vacancies/[id]` - Gestionar vacante específica
- `POST /api/applications` - Recibir aplicaciones de candidatos
- `POST /api/ai/optimize-description` - Optimizar descripción con IA
- `POST /api/ai/analyze-candidate` - Analizar CV con IA
- `POST /api/ai/generate-offer` - Generar carta de oferta

## 💡 Uso

### Panel Administrativo
1. Accede a `/dashboard`
2. Crea una nueva vacante con el botón "Nueva Vacante"
3. Opcionalmente, usa IA para optimizar la descripción
4. Publica la vacante
5. Revisa candidatos en el Dashboard Kanban

### Postulación de Candidatos
1. Los candidatos acceden a `/vacancies`
2. Seleccionan una vacante
3. Completan el formulario y suben su CV
4. La IA analiza automáticamente al candidato
5. Se asigna puntuación y clasificación

## 📝 Scripts Disponibles

```bash
npm run dev        # Inicia servidor de desarrollo
npm run build      # Construye para producción
npm run start      # Inicia servidor de producción
npm run seed       # Carga datos de prueba
npm run lint       # Ejecuta el linter
```

## 🚀 Deploy en Vercel

### Deploy Rápido (Sin Base de Datos)
1. Haz fork del repositorio
2. Conecta tu repo en [Vercel](https://vercel.com)
3. Agrega la variable de entorno `OPENAI_API_KEY` (opcional)
4. Deploy automático con datos mock 🎉

### Deploy Completo (Con MongoDB Atlas)
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster y obtén tu connection string
3. En Vercel, agrega las variables de entorno:
   ```
   OPENAI_API_KEY=tu-api-key
   MONGODB_URI=mongodb+srv://...
   ```
4. Deploy y listo 🚀

**Nota**: Sin `OPENAI_API_KEY`, las funciones de IA no estarán disponibles, pero la app funcionará con datos estáticos.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**Luciano Mas**
- GitHub: [@luciannomas](https://github.com/luciannomas)

## 🙏 Agradecimientos

- OpenAI por su poderosa API
- Shadcn UI por los componentes hermosos
- Vercel por Next.js

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
