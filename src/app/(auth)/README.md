# Autenticación - PideAI Admin

Este directorio contiene las páginas de autenticación del panel de administración.

## 📁 Estructura

```
src/app/(auth)/
├── layout.tsx          # Layout para páginas de auth
├── login/
│   └── page.tsx        # Página de login
└── README.md           # Esta documentación
```

## 🔐 Página de Login

### Características

- **Autenticación con Supabase**: Usa `supabase.auth.signInWithPassword()`
- **Validación de roles**: Solo permite acceso a usuarios con roles de administrador
- **UI limpia**: Diseño inspirado en resend.com
- **Mensajes de error amigables**: Traduce errores técnicos a mensajes comprensibles
- **Loading states**: Muestra indicador de carga durante autenticación
- **Validación de formulario**: Valida campos requeridos

### Flujo de Autenticación

1. **Usuario ingresa credenciales**
   - Email y contraseña

2. **Autenticación con Supabase**
   ```tsx
   const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password,
   })
   ```

3. **Obtención de perfil**
   ```tsx
   const { data: profile } = await supabase
     .from('profiles')
     .select('role')
     .eq('id', user.id)
     .single()
   ```

4. **Validación de rol**
   - Roles válidos: `admin`, `sub-admin`, `soporte`
   - Si el rol no es válido, se hace `signOut()` automáticamente

5. **Redirección**
   - Si todo es válido → `/dashboard`
   - El middleware protege las rutas automáticamente

### Roles de Usuario

#### Admin
- Acceso completo a todas las funcionalidades
- Puede gestionar usuarios, configuración global, etc.

#### Sub-Admin
- Acceso limitado (sin configuración global)
- Puede gestionar pedidos, riders, comercios

#### Soporte
- Solo lectura
- Puede actualizar estado de pedidos
- No puede crear, editar o eliminar

### Manejo de Errores

El componente traduce errores de Supabase a mensajes amigables:

| Error de Supabase | Mensaje al Usuario |
|-------------------|-------------------|
| `Invalid login credentials` | Email o contraseña incorrectos |
| `Email not confirmed` | Por favor confirma tu email antes de iniciar sesión |
| `Too many requests` | Demasiados intentos. Espera un momento |
| Sin perfil de admin | No se encontró un perfil de administrador |
| Rol no válido | No tienes permisos de administrador |

### Seguridad

#### Validaciones Implementadas

1. **Campos requeridos**: Email y contraseña no pueden estar vacíos
2. **Rol de administrador**: Solo usuarios con roles válidos pueden acceder
3. **Cierre de sesión automático**: Si el rol no es válido, se hace signOut
4. **Rate limiting**: Supabase maneja automáticamente demasiados intentos

#### Mejores Prácticas

- ✅ Las contraseñas nunca se muestran en el código
- ✅ Los errores no exponen información sensible
- ✅ La validación se hace en el servidor (tabla profiles)
- ✅ El middleware protege las rutas del dashboard

### Uso

#### Para Desarrolladores

```tsx
// El componente es 'use client' porque usa hooks
'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

#### Para Testing

**Usuario de prueba** (debe crearse en Supabase):

1. Crear usuario en Supabase Authentication
2. Agregar registro en tabla `profiles`:
   ```sql
   INSERT INTO profiles (id, email, role, full_name)
   VALUES (
     'user-id-from-auth',
     'admin@pideai.com',
     'admin',
     'Administrador de Prueba'
   );
   ```

### UI/UX

#### Diseño

- Layout centrado con Card de ShadCN
- Gradiente sutil en el fondo
- Logo placeholder de PideAI (reemplazar con logo real)
- Responsive design

#### Estados

1. **Normal**: Formulario listo para input
2. **Loading**: Botón disabled con spinner
3. **Error**: Banner rojo con mensaje de error
4. **Success**: Redirección automática (no se ve)

### Próximas Mejoras

- [ ] Página de recuperación de contraseña (`/forgot-password`)
- [ ] Página de reset de contraseña (`/reset-password`)
- [ ] 2FA (autenticación de dos factores)
- [ ] Rate limiting visual (mostrar tiempo de espera)
- [ ] Recordar sesión (checkbox "Mantenerme conectado")

### Dependencias

- `@/lib/supabase/client` - Cliente de Supabase para el navegador
- `@/components/ui/button` - Botón de ShadCN
- `@/components/ui/input` - Input de ShadCN
- `@/components/ui/label` - Label de ShadCN
- `@/components/ui/card` - Card de ShadCN
- `@/types` - Tipos de la aplicación (UserRole)

### Testing Manual

1. **Login exitoso**:
   - Ingresar credenciales válidas
   - Verificar redirección a /dashboard

2. **Login fallido - Credenciales incorrectas**:
   - Ingresar email/password incorrectos
   - Verificar mensaje de error

3. **Login fallido - Sin rol de admin**:
   - Ingresar usuario sin perfil en tabla profiles
   - Verificar mensaje de error
   - Verificar que se hizo signOut

4. **Validación de campos**:
   - Intentar submit con campos vacíos
   - Verificar mensaje de validación

---

**Última actualización:** 2025-10-31
**Versión:** 1.0
