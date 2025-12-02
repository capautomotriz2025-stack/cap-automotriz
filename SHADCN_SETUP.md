# 🎨 Configuración de shadcn/ui

## ✅ **Estado Actual**

shadcn/ui ya está configurado en el proyecto con los siguientes componentes:

### **Componentes Instalados:**

✅ Button  
✅ Card (CardHeader, CardTitle, CardDescription, CardContent, CardFooter)  
✅ Input  
✅ Label  
✅ Textarea  
✅ Badge  
✅ Dialog  

### **Configuración:**

- ✅ `components.json` - Archivo de configuración
- ✅ `tailwind.config.ts` - Configurado con variables CSS
- ✅ `app/globals.css` - Estilos con variables de shadcn
- ✅ `lib/utils.ts` - Función `cn()` para merge de clases

---

## 🎨 **Componentes Disponibles**

Todos los componentes ya están creados en `components/ui/`:

```
components/ui/
├── badge.tsx         ✅ Badges con variantes
├── button.tsx        ✅ Botones con variantes y tamaños
├── card.tsx          ✅ Cards completas
├── dialog.tsx        ✅ Modales
├── input.tsx         ✅ Inputs de texto
├── label.tsx         ✅ Labels de formulario
└── textarea.tsx      ✅ Áreas de texto
```

---

## 🚀 **Cómo Usar los Componentes**

### **Button**
```tsx
import { Button } from '@/components/ui/button'

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button size="lg">Large</Button>
```

### **Card**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido aquí
  </CardContent>
</Card>
```

### **Badge**
```tsx
import { Badge } from '@/components/ui/badge'

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
```

### **Input & Label**
```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Email" />
</div>
```

---

## 🎨 **Sistema de Colores**

El proyecto usa las variables de color de shadcn:

```css
--background: Color de fondo principal
--foreground: Color de texto principal
--primary: Color primario (azul)
--secondary: Color secundario
--muted: Color apagado
--accent: Color de acento
--destructive: Color para acciones destructivas (rojo)
--border: Color de bordes
--input: Color de inputs
--ring: Color de focus ring
```

---

## 📦 **Para Agregar Más Componentes**

Si necesitas más componentes de shadcn, puedes:

### **Opción 1: Copiar manualmente**
1. Ve a https://ui.shadcn.com/docs/components
2. Copia el código del componente
3. Pégalo en `components/ui/[nombre].tsx`

### **Opción 2: Usar CLI (si npm funciona)**
```bash
npx shadcn-ui@latest add [component-name]
```

---

## 🎯 **Componentes Que Podrías Necesitar**

### **Para agregar después:**
- [ ] Select/Dropdown
- [ ] Tabs
- [ ] Toast/Notifications
- [ ] Checkbox
- [ ] Radio Group
- [ ] Switch
- [ ] Slider
- [ ] Progress
- [ ] Skeleton
- [ ] Alert
- [ ] Avatar
- [ ] Calendar
- [ ] DataTable

---

## ✨ **Ventajas de shadcn/ui**

1. **Copy-paste**: No es una librería de npm, es código que posees
2. **Personalizable**: Edita directamente los componentes
3. **Accesible**: Construido sobre Radix UI
4. **TypeScript**: Completamente tipado
5. **Tailwind**: Usa Tailwind CSS
6. **React Server Components**: Compatible con Next.js 14

---

## 🎨 **Paleta de Colores Actual**

```
Azul:     from-blue-600 to-indigo-600
Verde:    from-green-600 to-emerald-600  
Púrpura:  from-purple-600 to-pink-600
Naranja:  from-orange-600 to-red-600
```

---

¡Tu proyecto ya tiene shadcn/ui completamente configurado y listo para usar! 🚀

