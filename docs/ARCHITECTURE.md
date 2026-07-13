# 🏗️ ARCHITECTURE.md — ProfeApp

---

## 1. Vista General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                          USUARIO                                 │
│              (Navegador web / Celular / Tablet)                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND — Render Static Site                       │
│         React 18 + Vite + Tailwind CSS + Zustand                │
│                  profe-app.onrender.com                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API (HTTPS/JSON)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND — Render Web Service                        │
│          Node.js 20 + Express 5 + Mongoose 8                    │
│              profe-app-api.onrender.com                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ MongoDB Wire Protocol (TLS)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│           BASE DE DATOS — MongoDB Atlas (M0)                     │
│              Cluster: cluster0.xxxxx.mongodb.net                 │
│              DB: profeapp                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Técnico Detallado

### 2.1 Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.x | Framework UI |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Estilos utilitarios |
| Zustand | 4.x | Estado global (auth, theme, UI) |
| TanStack Query | 5.x | Server state, caché y sincronización |
| React Router | 6.x | Navegación SPA |
| Axios | 1.x | Cliente HTTP con interceptores |
| Recharts | 2.x | Gráficos (histograma, líneas) |
| react-hot-toast | 2.x | Notificaciones |
| @dnd-kit | 6.x | Drag & drop (reordenar lista) |
| xlsx | 0.18.x | Exportar a Excel |
| jsPDF + autoTable | — | Exportar a PDF |
| date-fns | 3.x | Manejo de fechas |

### 2.2 Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| Express | 5.x | Framework HTTP |
| Mongoose | 8.x | ODM MongoDB |
| jsonwebtoken | 9.x | JWT access tokens |
| bcryptjs | 2.x | Hash de contraseñas |
| express-validator | 7.x | Validación de inputs |
| helmet | 7.x | Headers de seguridad |
| cors | 2.x | CORS configurable |
| morgan | 1.x | Logger HTTP |
| nodemailer | 6.x | Emails (recuperación de contraseña) |
| dotenv | 16.x | Variables de entorno |
| express-rate-limit | 7.x | Rate limiting |
| cookie-parser | 1.x | Refresh token en httpOnly cookie |

### 2.3 Base de Datos

- **Motor:** MongoDB Atlas M0 (gratuito, 512 MB)
- **ODM:** Mongoose con TypeScript-like schemas
- **Estrategia de índices:** índices compuestos en `userId + courseId` para aislar datos por usuario
- **Backups:** automáticos en Atlas (diario, 7 días retención en M0)

---

## 3. Flujo de Autenticación

```
[LOGIN]
Usuario → POST /api/auth/login
          ↓
          Verifica email + password (bcrypt)
          ↓
          Genera:
            - accessToken  (JWT, 15 minutos, payload: { userId, role })
            - refreshToken (JWT, 7 días, almacenado en DB + httpOnly cookie)
          ↓
          Response: { accessToken, user: { id, name, email, theme } }

[REQUESTS AUTENTICADOS]
Frontend → Axios interceptor: Authorization: Bearer <accessToken>
         ↓
         Backend middleware: verifyToken → extrae userId
         ↓
         Controllers usan userId para filtrar datos (aislamiento)

[REFRESH]
accessToken expirado → Axios interceptor detecta 401
                     → POST /api/auth/refresh (cookie httpOnly con refreshToken)
                     → Nuevo accessToken → reintenta request original

[LOGOUT]
POST /api/auth/logout → borra refreshToken en DB + limpia cookie
```

---

## 4. Estructura del Backend

```
backend/
├── src/
│   ├── index.js                    # Entry point, Express setup
│   ├── config/
│   │   ├── db.js                   # Conexión MongoDB Atlas
│   │   └── constants.js            # NOTA_MIN, NOTA_MAX, APROBACION, etc.
│   ├── middleware/
│   │   ├── auth.js                 # verifyToken middleware
│   │   ├── errorHandler.js         # Global error handler
│   │   └── rateLimiter.js          # express-rate-limit configs
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Student.js
│   │   ├── Evaluation.js
│   │   ├── Grade.js
│   │   └── Observation.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── courses.routes.js
│   │   ├── students.routes.js
│   │   ├── evaluations.routes.js
│   │   ├── grades.routes.js
│   │   └── observations.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── courses.controller.js
│   │   ├── students.controller.js
│   │   ├── evaluations.controller.js
│   │   ├── grades.controller.js
│   │   └── observations.controller.js
│   ├── services/
│   │   ├── stats.service.js        # Cálculo de promedios, estadísticas
│   │   ├── export.service.js       # Generación de Excel/PDF (server-side)
│   │   └── email.service.js        # Nodemailer
│   └── utils/
│       ├── gradeCalculator.js      # Lógica de promedio ponderado
│       └── validators.js           # Helpers de validación
└── package.json
```

---

## 5. Estructura del Frontend

```
frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx                     # Router + providers
│   ├── api/
│   │   ├── client.js               # Axios instance + interceptores
│   │   ├── auth.api.js
│   │   ├── courses.api.js
│   │   ├── students.api.js
│   │   ├── evaluations.api.js
│   │   ├── grades.api.js
│   │   └── observations.api.js
│   ├── store/
│   │   ├── authStore.js            # Zustand: user, token, logout
│   │   └── themeStore.js           # Zustand: tema activo
│   ├── themes/
│   │   ├── themes.js               # Definición de los 5 temas (tokens CSS)
│   │   └── ThemeProvider.jsx       # Aplica CSS variables al :root
│   ├── components/                 # Componentes reutilizables
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx           # Aprobado/Reprobado
│   │   │   ├── StatCard.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx       # Sidebar + Header + main
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── ThemeSwitcher.jsx
│   │   └── grades/
│   │       ├── GradeGrid.jsx       # La tabla principal de notas
│   │       ├── GradeCell.jsx       # Celda editable individual
│   │       └── GradeStats.jsx      # Estadísticas al pie
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ForgotPasswordPage.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx   # Resumen todos los cursos
│   │   ├── courses/
│   │   │   ├── CoursesPage.jsx     # Lista de cursos
│   │   │   ├── CourseDetailPage.jsx# Grilla de notas
│   │   │   ├── CourseForm.jsx      # Crear/Editar curso
│   │   │   └── CourseStats.jsx     # Estadísticas del curso
│   │   ├── students/
│   │   │   ├── StudentsList.jsx
│   │   │   ├── StudentForm.jsx
│   │   │   └── StudentProfile.jsx  # Ficha del alumno
│   │   ├── evaluations/
│   │   │   ├── EvaluationsList.jsx
│   │   │   └── EvaluationForm.jsx
│   │   └── observations/
│   │       ├── ObservationsList.jsx
│   │       └── ObservationForm.jsx
│   ├── hooks/
│   │   ├── useGradeInput.js        # Lógica teclado + autoguardado
│   │   ├── useStats.js             # Calcular stats localmente
│   │   └── useDebounce.js
│   └── utils/
│       ├── gradeHelpers.js         # weightedAverage, situacion, etc.
│       └── formatters.js           # Formato de notas, fechas
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 6. Cálculo de Promedio Ponderado

El algoritmo replica la fórmula del Excel (SUMPRODUCT):

```javascript
// gradeHelpers.js
export function weightedAverage(grades, evaluations, decimals = 1) {
  // grades: [{ evaluationId, value }]
  // evaluations: [{ _id, weight }]
  
  let sumProduct = 0;
  let sumWeights = 0;

  for (const evaluation of evaluations) {
    const grade = grades.find(g => g.evaluationId === evaluation._id);
    if (grade && grade.value !== null && grade.value !== undefined) {
      sumProduct += grade.value * evaluation.weight;
      sumWeights += evaluation.weight;
    }
  }

  if (sumWeights === 0) return null; // Sin notas

  const avg = sumProduct / sumWeights;
  return parseFloat(avg.toFixed(decimals));
}

export function getSituacion(avg, passGrade = 4.0) {
  if (avg === null) return 'sin_notas';
  return avg >= passGrade ? 'aprobado' : 'reprobado';
}
```

---

## 7. Seguridad

| Capa | Medida |
|---|---|
| Transport | HTTPS forzado en Render |
| Auth | JWT de corta duración (15m) + refresh en httpOnly cookie |
| Autorización | Middleware verifica `userId` en todos los endpoints protegidos |
| Contraseñas | bcrypt con salt rounds = 12 |
| Inputs | express-validator en todos los endpoints POST/PUT/PATCH |
| Headers | helmet.js (X-Frame-Options, CSP, etc.) |
| Rate limit | 100 req/min general, 10 req/15min en /auth/login |
| CORS | Solo permite origen del frontend de Render |
| MongoDB | Usuario de DB con permisos mínimos (readWrite en 1 DB) |

---

## 8. Variables de Entorno

### Backend (`.env`)
```env
NODE_ENV=production
PORT=4000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/profeapp?retryWrites=true&w=majority

# JWT
JWT_ACCESS_SECRET=<string aleatorio 64 chars>
JWT_REFRESH_SECRET=<string aleatorio 64 chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend (para CORS)
FRONTEND_URL=https://profe-app.onrender.com

# Email (Nodemailer - usar Gmail App Password o Brevo/Resend)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM="ProfeApp <no-reply@profeapp.com>"
```

### Frontend (`.env`)
```env
VITE_API_URL=https://profe-app-api.onrender.com/api
```

---

## 9. Diagrama de Relaciones de Datos

```
User (1) ──────────────── (N) Course
                                │
                    ┌───────────┴───────────┐
                    │                       │
                   (N) Student            (N) Evaluation
                    │                       │
                    └───────────┬───────────┘
                                │
                               (N) Grade
                                (studentId + evaluationId → unique)

Student (1) ──── (N) Observation
```

---

## 10. Convenciones de Código

- **Backend:** CommonJS (`require/module.exports`), async/await, manejo de errores con try/catch + errorHandler middleware
- **Frontend:** ESModules, functional components, custom hooks para lógica, TanStack Query para toda la comunicación con la API
- **Nombrado:** camelCase JS, kebab-case archivos, PascalCase componentes React
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`)
