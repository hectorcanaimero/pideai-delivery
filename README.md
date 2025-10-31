# PideAI Admin - Panel de Administración

Panel de administración para la plataforma de delivery PideAI, construido con Next.js 16, React 19, TypeScript y Supabase.

## 🚀 Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Components:** ShadCN UI
- **Backend:** Supabase (Auth, Database, Realtime)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** Sonner

## 📋 Prerequisitos

- Node.js 18+
- pnpm 9+
- Cuenta de Supabase

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/hectorcanaimero/pideai-delivery.git
cd addons
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.local.example .env.local
```

Edita `.env.local` y agrega tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Ejecutar en modo desarrollo**
```bash
pnpm dev
```

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000)

## 📦 Scripts Disponibles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm start` - Inicia el servidor de producción
- `pnpm lint` - Ejecuta el linter

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Grupo de rutas de autenticación
│   ├── (dashboard)/       # Grupo de rutas del dashboard
│   ├── layout.tsx         # Layout raíz
│   └── globals.css        # Estilos globales
├── components/
│   ├── ui/                # Componentes de ShadCN UI
│   ├── layout/            # Componentes de layout (Sidebar, Header)
│   ├── dashboard/         # Componentes del dashboard
│   ├── orders/            # Componentes de pedidos
│   ├── riders/            # Componentes de riders
│   └── stores/            # Componentes de comercios
├── lib/
│   ├── supabase/          # Configuración de Supabase
│   ├── api/               # Funciones de API
│   └── utils.ts           # Utilidades
├── hooks/                 # Custom hooks
└── types/                 # Tipos de TypeScript
```

## 🎯 Funcionalidades

- ✅ Setup inicial del proyecto (TASK-001)
- ⏳ Autenticación con Supabase
- ⏳ Dashboard con métricas en tiempo real
- ⏳ Gestión de pedidos
- ⏳ Gestión de riders
- ⏳ Gestión de comercios
- ⏳ Sistema de reportes
- ⏳ Notificaciones en tiempo real

## 📚 Documentación

Para más información sobre el proyecto, consulta:
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Plan completo del proyecto
- [TECH_TASKS.md](./TECH_TASKS.md) - Tareas técnicas detalladas
- [CLAUDE.md](./CLAUDE.md) - Guía para Claude Code

## 🤝 Contribución

1. Crea un branch desde `main` para tu feature
2. Realiza tus cambios
3. Crea un Pull Request
4. Espera la revisión y aprobación

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Desarrollado con ❤️ para PideAI Delivery**
