# Properlia 2025 - Características del Proyecto

## Arquitectura General

### Monorepo con 4 paquetes:
- **Backend** - API REST en Rails 7
- **Frontend** - Sitio público en Next.js 14/16
- **Dashboard** - Panel administrativo en Next.js 14/16
- **Shared** - Componentes y lógica compartida

### Stack Tecnológico:
- **Backend:** Ruby on Rails 7 (modo API)
- **Frontend/Dashboard:** Next.js 16 con React 19, TypeScript
- **Base de datos:** PostgreSQL 15 con UUIDs
- **Estilos:** Tailwind CSS 4
- **Estado:** TanStack Query (React Query) v5
- **Animaciones:** Motion (Framer Motion)
- **Iconos:** Lucide React
- **Utilidades:** class-variance-authority, clsx, tailwind-merge

---

## Autenticación y Seguridad

1. **Devise + JWT** para autenticación basada en tokens
2. **Sesiones stateless** con JSON Web Tokens
3. **CORS configurado** para orígenes específicos
4. **Roles de usuario** (campo `role` en modelo User)
5. **Validaciones de seguridad** en controladores

---

## Gestión de Propiedades

### Modelo de Propiedades con:
- Título, descripción, dirección completa
- Precio con validación numérica
- Áreas (terreno y construida)
- Características: habitaciones, baños, medios baños, estacionamientos
- **Ubicación:** ciudad, estado, código postal, vecindario, coordenadas
- **Categorización:** tipo de propiedad, estatus, tipo de listado
- **Marcadores:** propiedad destacada, listado exclusivo
- **Multimedia:** imágenes y videos múltiples vía Active Storage
- **Índices de base de datos** para búsqueda optimizada

### Tipos de Propiedad (Property Types):
- Casa, departamento, terreno, etc.
- Nombres bilingües (inglés/español)

### Estados de Propiedad (Statuses):
- Disponible, vendida, rentada, etc.
- Nombres bilingües

### Tipos de Listado (Listing Types):
- Venta, renta, etc.
- Nombres bilingües

---

## Gestión de Multimedia

1. **Active Storage** integrado
2. **Soporte para imágenes** con validación de tipo
3. **Soporte para videos** con validación de tipo
4. **Almacenamiento flexible:**
   - Local para desarrollo
   - AWS S3 para staging/producción
5. **Procesamiento de imágenes** con ImageMagick
6. **Conversión a WebP** para optimización

---

## Frontend Público

### Páginas:
- **Inicio** - Página principal con hero y propiedades destacadas
- **Listado de propiedades** con filtros avanzados
- **Detalle de propiedad** con galería multimedia

### Componentes:
- `Hero` - Sección principal
- `FeaturedProperties` - Propiedades destacadas
- `Navigation` - Barra de navegación
- `PropertyCard` - Tarjeta de propiedad estándar
- `PropertyCardCompact` - Tarjeta compacta
- `PropertyFiltersBar` - Barra de filtros
- `PropertyStatsGrid` / `PropertyLabelStats` - Estadísticas
- `NoResultsAlert` - Mensaje cuando no hay resultados
- Sistema de badges dinámicos para propiedades

### Características del Frontend:
- **Internacionalización** (i18n) con rutas [locale]
- **Renderizado del lado del cliente** para páginas de propiedades
- **Optimización de imágenes** Next.js
- **Animaciones fluidas** con Motion
- **Diseño responsive** con Tailwind CSS

---

## Dashboard Administrativo

### Páginas:
- **Login** - Autenticación de administradores
- **Dashboard principal** - Vista general del sistema
- **Gestión de propiedades:**
  - Lista con tabla paginada
  - Formulario de creación/edición
  - Vista detallada de cada propiedad
- **Información general** - Configuración de contacto

### Características del Dashboard:
- **CRUD completo** de propiedades
- **Dropdown de acciones** por propiedad
- **Modal de Fact Sheet** para generar PDFs
- **Testing integrado** con Vitest + Testing Library
- **Formularios reactivos** para gestión de datos
- **Subida de múltiples archivos** (imágenes y videos)

---

## Funcionalidades de Comunicación

1. **API de envío de emails** para contacto
2. **Integración con Resend** para email delivery
3. **Información de contacto global:**
   - Teléfono
   - WhatsApp
   - Email
   - Modelo singleton (GeneralInfo)

---

## Generación de PDFs

1. **Endpoint dedicado** para generación de PDFs
2. **Biblioteca Prawn** para creación de documentos
3. **Prawn-table** para tablas estructuradas
4. **Códigos QR** con rqrcode
5. **Plantillas personalizadas** de fact sheets
6. **Modal dedicado** en dashboard para generar PDFs

---

## Optimización de Performance

1. **Paginación del lado del servidor** con Pagy gem
2. **Caché agresivo de React Query:**
   - General Info: 24h stale time, 7 días GC time
   - Propiedades: configuración optimizada
3. **Índices de base de datos** en campos clave
4. **Constraints de base de datos** para validaciones rápidas
5. **Lazy loading** de componentes
6. **Conversión de imágenes a WebP**

---

## API REST

### Endpoints Públicos:
- `GET /api/v1/properties` - Listar propiedades (paginado)
- `GET /api/v1/properties/:id` - Detalle de propiedad
- `GET /api/v1/property_types` - Tipos de propiedad
- `GET /api/v1/statuses` - Estados
- `GET /api/v1/listing_types` - Tipos de listado
- `GET /api/v1/general_info` - Información de contacto
- `POST /api/v1/emails` - Enviar email de contacto

### Endpoints Protegidos (requieren JWT):
- `POST /api/v1/properties` - Crear propiedad
- `PUT /api/v1/properties/:id` - Actualizar propiedad
- `DELETE /api/v1/properties/:id/attachments/:id` - Eliminar archivo
- `POST /api/v1/pdfs` - Generar PDF
- CRUD de tipos, estados y listings

### Autenticación:
- `POST /users` - Registro
- `POST /users/sign_in` - Login
- `DELETE /users/sign_out` - Logout

---

## DevOps y Deployment

1. **Docker Compose** para desarrollo
2. **Configuraciones separadas:**
   - `docker-compose.yml` - desarrollo
   - `docker-compose.stage.yml` - staging
   - `docker-compose.prod.yml` - producción
3. **GitHub Actions** para CI/CD
4. **Amazon ECR** para registro de imágenes
5. **Deployment automatizado a EC2**
6. **Variables de entorno** por ambiente
7. **Migraciones automáticas** en deploy

---

## Paquete Shared

### Exportaciones:
- Componentes UI reutilizables
- Servicios de API compartidos
- Utilidades y helpers
- Tipos TypeScript
- Estilos globales
- Función `getBadge` para badges dinámicos
- Traducciones (en.json, es.json)

---

## Testing

### Backend:
- RSpec configurado
- FactoryBot para fixtures
- Faker para datos de prueba
- Shoulda Matchers para validaciones

### Dashboard:
- Vitest como test runner
- Testing Library para componentes React
- Vitest UI para interfaz visual
- Coverage reports

---

## Internacionalización

1. **Soporte bilingüe** (español/inglés)
2. **Rutas dinámicas** con parámetro [locale]
3. **Archivos de traducción** en shared package
4. **Nombres bilingües** en modelos de catálogo

---

## Características Técnicas Adicionales

1. **UUID como primary keys** en toda la base de datos
2. **Extensión pgcrypto** para UUID generation
3. **JSONB** para almacenamiento flexible
4. **GIN indexes** para búsqueda en JSONB
5. **Check constraints** a nivel de base de datos
6. **Foreign keys** con cascadas apropiadas
7. **Validaciones en modelo y base de datos**

---

## Estructura del Proyecto

```
properlia2025/
├── packages/
│   ├── backend/          # Rails API + PostgreSQL (puerto 3000)
│   ├── frontend/         # Sitio público Next.js (puerto 3001)
│   ├── dashboard/        # Panel admin Next.js (puerto 3002)
│   └── shared/           # Código compartido
├── docker-compose*.yml   # Configuraciones Docker
└── .github/workflows/    # CI/CD Pipeline
```

---

## Base de Datos

### Tablas Principales:

#### Properties (Propiedades)
- UUID como ID
- featured (boolean) - Propiedad destacada
- exclusive_listing (boolean) - Listado exclusivo
- title, description (text)
- land_area, built_area (decimal)
- rooms, bathrooms, half_bathrooms, parking_spaces (integer)
- price (decimal 12,2)
- address, city, state, neighborhood, zip_code (string)
- coordinates (string)
- images (jsonb array)
- Referencias: property_type_id, status_id, listing_type_id

#### Users (Usuarios)
- UUID como ID
- email (único, índice)
- encrypted_password
- name, role
- jti (JWT identifier, único)
- Campos Devise estándar

#### Property Types (Tipos de Propiedad)
- UUID como ID
- name, es_name (únicos)

#### Statuses (Estados)
- UUID como ID
- name, es_name (únicos)

#### Listing Types (Tipos de Listado)
- UUID como ID
- name, es_name (únicos)

#### General Infos (Información General)
- UUID como ID
- phone, whatsapp, email_to
- singleton_guard (índice único en 0)

#### Active Storage
- Tablas estándar de Active Storage para archivos
- Soporte para attachments y variant_records

---

## Casos de Uso Principales

### Usuario Público:
1. Navegar propiedades en el sitio web
2. Filtrar por tipo, precio, ubicación, características
3. Ver detalles completos y galería multimedia
4. Contactar vía email o WhatsApp
5. Ver propiedades destacadas en homepage

### Administrador:
1. Autenticarse en el dashboard
2. Crear, editar y eliminar propiedades
3. Subir múltiples imágenes y videos
4. Marcar propiedades como destacadas
5. Cambiar estado y tipo de listado
6. Generar fact sheets en PDF
7. Actualizar información de contacto global
8. Ver lista paginada de todas las propiedades

---

## Flujos de Trabajo

### Desarrollo:
1. `docker-compose up` - Iniciar todos los servicios
2. Backend en `localhost:3000`
3. Frontend en `localhost:3001`
4. Dashboard en `localhost:3002`
5. PostgreSQL en `localhost:5432`

### Deployment:
1. Push a rama específica (main/stage)
2. GitHub Actions construye imágenes Docker
3. Sube a Amazon ECR con tags apropiados
4. Deploy automático a EC2
5. Ejecuta migraciones de base de datos
6. Restart de servicios

---

## Seguridad Implementada

1. **Autenticación JWT** con expiración de tokens
2. **CORS** configurado para orígenes específicos
3. **Validación de archivos** (solo imágenes/videos)
4. **SQL injection** prevenido por ActiveRecord
5. **XSS** prevenido por sanitización de React
6. **HTTPS** en producción (recomendado)
7. **Variables de entorno** para secretos
8. **Rate limiting** (a implementar)
9. **Validaciones** en modelo y base de datos

---

## Tecnologías y Gemas Principales

### Backend (Ruby Gems):
- rails (~> 7.0.8)
- pg (~> 1.1) - PostgreSQL
- puma (~> 5.0) - Servidor web
- devise - Autenticación
- devise-jwt - JWT tokens
- pagy - Paginación
- rack-cors - CORS
- aws-sdk-s3 - Almacenamiento S3
- image_processing - Procesamiento de imágenes
- prawn, prawn-table - Generación de PDFs
- rqrcode - Códigos QR
- resend - Email delivery
- rspec-rails - Testing
- factory_bot_rails - Fixtures
- faker - Datos de prueba

### Frontend/Dashboard (NPM):
- next (16.0.3) - Framework React
- react (19.2.0)
- typescript (5.9.3)
- @tanstack/react-query (5.90.12) - Estado/cache
- tailwindcss (4.1.17) - Estilos
- lucide-react - Iconos
- motion (12.23.24) - Animaciones
- clsx, tailwind-merge - Utilidades CSS
- vitest - Testing (dashboard)

---

## Configuración de Entornos

### Variables Requeridas:

#### Backend:
- `DEVISE_JWT_SECRET_KEY` - Secret para JWT
- `DATABASE_URL` - Conexión PostgreSQL
- `RAILS_ENV` - development/staging/production
- `AWS_ACCESS_KEY_ID` - Credenciales AWS (opcional)
- `AWS_SECRET_ACCESS_KEY` - Secret AWS (opcional)
- `AWS_REGION` - Región AWS (opcional)
- `S3_BUCKET_NAME` - Bucket S3 (opcional)
- `ACTIVE_STORAGE_SERVICE` - local/amazon

#### Frontend:
- `NEXT_PUBLIC_API_URL` - URL del backend API

### Puertos:
- Backend: 3000
- Frontend: 3001
- Dashboard: 3002
- PostgreSQL: 5432

---

## Roadmap y Mejoras Futuras

### Posibles Mejoras:
1. Sistema de favoritos para usuarios
2. Comparador de propiedades
3. Búsqueda geográfica con mapas
4. Notificaciones push
5. Chat en vivo
6. Integración con CRM
7. Analytics y reportes
8. Sistema de citas/tours
9. Calculadora de hipotecas
10. Exportación bulk de datos

### Optimizaciones Pendientes:
1. Rate limiting en API
2. Redis para caché backend
3. CDN para assets estáticos
4. Lazy loading de imágenes
5. Service workers para PWA
6. Compresión de imágenes automática
7. Thumbnails optimizados

---

## Documentación Adicional

- `README.md` - Guía de instalación y uso
- `ARCHITECTURE.md` - Arquitectura del sistema
- `DOCKER_QUICK_REFERENCE.md` - Comandos Docker
- `GENERAL_INFO_CACHING.md` - Estrategia de caché

---

## Contacto y Soporte

Para preguntas sobre el proyecto, consultar la documentación en el repositorio o contactar al equipo de desarrollo.

---

**Versión:** 1.0.0
**Última actualización:** Enero 2026
**Estado:** En desarrollo activo
