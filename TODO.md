# TODO — Mi2ente (ProfeApp)

> Estado del proyecto. Actualizado 2026-04-17. Marcar con `[x]` al completar.

---

## ✅ HECHO

### Backend
- [x] Setup: Express 4, Mongoose, CORS, Helmet, Morgan, dotenv
- [x] Conexión MongoDB Atlas (`config/db.js`)
- [x] Middleware: `verifyToken`, `errorHandler`, `rateLimiter`
- [x] Middleware: `validate.js` con express-validator (auth, courses, students, grades, evaluations)
- [x] Modelo `User` con bcrypt, refreshToken, resetPassword
- [x] Modelo `Course` con `gradeConfig` heredable
- [x] Modelo `Student` con virtual `fullName` e índices
- [x] Modelo `Evaluation` con `order` para drag & drop
- [x] Modelo `Grade` con upsert strategy y status (absent/exempt)
- [x] Modelo `Observation` con categorías
- [x] Modelo `School`
- [x] Auth controller: register, login, refresh, logout, forgotPassword, resetPassword
- [x] Users controller: getMe, updateMe, changePassword
- [x] Courses controller: list (con stats), create, getOne, update, delete (cascade), duplicate, getStats
- [x] Students controller: list (con promedios), create, getOne, update, delete, importStudents (xlsx)
- [x] Evaluations controller: list, create, update, reorder, delete
- [x] Grades controller: listByCourse, upsertGrade, batchUpsert
- [x] Observations controller: list, create, update, delete
- [x] Stats service: `getCourseStats`, `getDetailedStats` (promedio, mediana, stdDev, distribución)
- [x] Export service: `toExcel` con xlsx
- [x] Email service: `sendResetPassword` con nodemailer
- [x] `gradeCalculator.js`: `weightedAverage`, `getSituacion`, `calcStats`
- [x] Rutas anidadas en `courses.routes.js` (students, evals, grades, observations)
- [x] `/api/health` con verificación real de estado MongoDB
- [x] `.env.example`

### Frontend — Base
- [x] Setup: React 18 + Vite + Tailwind CSS + postcss
- [x] `index.html` con Google Fonts (Nunito, Inter)
- [x] `index.css` con 5 temas (CSS variables): rosa, oceano, bosque, noche, otono
- [x] `ThemeProvider` + `themeStore` (Zustand, persiste en localStorage)
- [x] `authStore` (Zustand): user, accessToken, isAuthenticated
- [x] `AuthBootstrap` para silent refresh al montar la app
- [x] `client.js`: Axios con interceptor de refresh automático (401 → refresh → retry)
- [x] API layer: `auth`, `users`, `courses`, `students`, `evaluations`, `grades`, `observations`, `schools`
- [x] `gradeHelpers.js`: weightedAverage, getSituacion, formatGrade
- [x] `formatters.js`: formatDate, formatShortDate, formatPercent, CATEGORY_LABELS, TYPE_LABELS
- [x] `useDebounce.js`
- [x] `useStats.js` hook

### Frontend — Componentes UI
- [x] `Button` (primary, secondary, danger, ghost · sm/md/lg · loading state)
- [x] `Input`, `Select`, `Textarea`
- [x] `Modal` (Escape para cerrar, scroll interno, overlay)
- [x] `Badge` (aprobado/reprobado/sin notas · CategoryBadge)
- [x] `StatCard`
- [x] `EmptyState`
- [x] `LoadingSpinner` + `PageLoader`
- [x] `ConfirmDialog` (modal propio, reemplaza `window.confirm()`)
- [x] `AppLayout` (sidebar fijo desktop + drawer mobile)
- [x] `Sidebar` (nav, tema switcher, logout)
- [x] `ThemeSwitcher` (pills de emoji)

### Frontend — GradeGrid
- [x] `GradeGrid`: tabla con columnas sticky (N°, apellido, nombre, promedio)
- [x] `GradeCell`: click para editar, validación 1.0–7.0, colores rojo/verde
- [x] Guardado inmediato al salir de celda (blur / Enter / Tab)
- [x] Estado local optimista (actualiza UI antes de respuesta)
- [x] `GradeStats`: promedio curso, máx, mín, % aprobación al pie
- [x] Aviso ⚠️ si ponderaciones ≠ 100%
- [x] Scroll horizontal con columnas fijas (mobile-ready)
- [x] Navegación por teclado (Tab, flechas entre celdas) — `onNavigate` implementado
- [x] Marcar nota como "ausente" o "exento/a" (status selector en GradeCell)
- [x] Toggle vista completa / solo promedios
- [x] Búsqueda de alumno dentro de la grilla

### Frontend — Páginas
- [x] `LoginPage`
- [x] `RegisterPage`
- [x] `ForgotPasswordPage`
- [x] `ResetPasswordPage` (ruta `/reset-password/:token`)
- [x] `DashboardPage` (resumen cursos + 3 stats cards + grid de CourseCards)
- [x] `CourseCard` (stats, barra de aprobación, menú editar/archivar/eliminar)
- [x] `CoursesPage` (filtro activo/archivado)
- [x] `CourseDetailPage` (tabs: Libro de notas / Alumnos / Evaluaciones)
  - [x] Importar alumnos desde CSV/Excel (botón + modal con resumen)
  - [x] Exportar a Excel (xlsx)
  - [x] Exportar a PDF (jsPDF + autoTable, client-side)
- [x] `CourseStats` (histograma distribución + línea evolución por evaluación, usa Recharts)
- [x] `CourseForm` (crear/editar)
- [x] `StudentForm` (crear/editar, datos apoderado en details)
- [x] `StudentProfile` (panel lateral slide-in, notas, observaciones CRUD)
- [x] `EvaluationForm` (crear/editar)
- [x] `EvaluationsList` (lista con editar/eliminar, total de ponderaciones)
- [x] `ProfilePage` (editar nombre/colegio, cambiar tema, cambiar contraseña)
- [x] `SettingsPage` (configuración global de notas: minGrade, maxGrade, passGrade, decimals)
- [x] `App.jsx` (router con guards RequireAuth / RequireGuest)
- [x] `main.jsx` (QueryClient, Toaster, ThemeProvider, BrowserRouter)

### Herramientas de desarrollo
- [x] Endpoint `POST /api/debug/seed` (solo en development) — crea cursos, alumnos, evaluaciones y notas de prueba
- [x] `DebugPanel` en frontend (solo en development) — botón seed + reset con feedback

---

## ❌ FALTANTE / PENDIENTE

### Backend
- [ ] **Multer para producción**: actualmente `memoryStorage` — revisar límites en Render free tier (512 MB RAM)
- [ ] **Estadísticas por evaluación en GET /courses**: el endpoint `list` no incluye `stats.byEvaluation` — solo la vista de detalle las tiene
- [ ] **Export PDF server-side**: decidido hacer client-side con jsPDF (no prioridad)

### Frontend — Funcionalidades
- [ ] **Duplicar curso desde la UI**: el backend tiene `POST /courses/:id/duplicate` pero no hay botón en `CourseCard`
- [ ] **Búsqueda de alumno en tab "Alumnos"**: la búsqueda existe en GradeGrid pero no en `StudentsTab`
- [ ] **Vista "alumnos reprobados"**: listado filtrado independiente (CourseStats muestra tabla pero no es una vista navegable)
- [ ] **Paginación** en lista de cursos (si el usuario tiene muchos cursos)
- [ ] **Toast de error en GradeCell**: muestra "✓" en la celda pero no hay feedback global cuando hay error de red

### UI / UX
- [ ] **Loading skeleton** en lugar de spinner para listas de cursos y alumnos
- [ ] **Animación slide-in** en `StudentProfile`: aparece sin transición CSS
- [ ] **Responsive GradeGrid en móvil**: probar en 360px real — columnas sticky pueden romperse
- [ ] **Tema Noche Índigo**: colores Tailwind hardcodeados (`bg-emerald-100`, `text-red-700`, etc.) no respetan variables CSS del tema oscuro
- [ ] **Hover en filas de GradeGrid**: `--color-row-hover` no aplica a celdas sticky (tienen `background` propio)
- [ ] **Accesibilidad (a11y)**: GradeCell tiene `tabIndex={0}` pero sin `role="gridcell"` ni ARIA labels
- [ ] **Estado vacío en Dashboard con cursos archivados**: si todos están archivados, muestra "sin cursos" en vez de aviso específico

### Calidad / Robustez
- [ ] **`QueryClient` invalidation**: después de guardar una nota no se invalida `['students', courseId]` — promedios en tab "Alumnos" quedan desactualizados
- [ ] **Rate limit feedback en UI**: si el usuario recibe 429, no hay mensaje claro en páginas de auth
- [ ] **Variables de entorno en producción**: documentar que `VITE_API_URL` debe apuntar a URL de Render

### Deploy / Infra
- [ ] `Procfile` o configuración de start para Render (backend)
- [ ] `render.yaml` con configuración de servicios (frontend static + backend web)
- [ ] Variables de entorno documentadas en `docs/DEPLOYMENT.md` para Render
- [ ] CORS actualizado para URL de producción de Render

---

## 📦 Dependencias instaladas

### Backend
```bash
cd backend && npm install
```

### Frontend
```bash
cd frontend && npm install
# recharts ya instalado — gráficos en CourseStats
```

---

## 🚀 Para arrancar en desarrollo

```bash
# Backend — copiar .env y completar MONGODB_URI + JWT secrets
cd backend && cp .env.example .env && npm install && npm run dev

# Frontend — nueva terminal
cd frontend && cp .env.example .env && npm install && npm run dev
```

### Seedear datos de prueba (solo en desarrollo)
Con el backend corriendo, ir al frontend y usar el botón **Debug** (esquina inferior derecha) → **Seedear datos**.
O directo desde la API:
```bash
curl -X POST http://localhost:5000/api/debug/seed \
  -H "Content-Type: application/json" \
  -d '{"email":"profe@test.com","password":"test1234"}'
```
