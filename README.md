# 📚 Mi2ente — Plataforma de Gestión Docente

> Aplicación web para profesores/as. Gestiona cursos, alumnos, evaluaciones, notas y observaciones desde cualquier dispositivo.

---

## 🗂️ Documentos del Proyecto

| Documento | Descripción |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Product Requirements Document — funcionalidades completas |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Arquitectura del sistema, stack técnico y flujo de datos |
| [`docs/DATA_MODELS.md`](docs/DATA_MODELS.md) | Esquemas MongoDB — colecciones y relaciones |
| [`docs/API_SPEC.md`](docs/API_SPEC.md) | Especificación REST API completa (endpoints, payloads, respuestas) |
| [`docs/UI_UX_GUIDE.md`](docs/UI_UX_GUIDE.md) | Guía de diseño UI/UX — 5 temas, componentes, flujos |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Deploy en Render (frontend + backend) + MongoDB Atlas |

---

## 🧱 Stack Tecnológico

```
Frontend   →  React 18 + Vite + Tailwind CSS     →  Render (Static Site)
Backend    →  Node.js 20 + Express + Mongoose     →  Render (Web Service)
Base Datos →  MongoDB Atlas (M0 free tier)
Auth       →  JWT (access token 15m + refresh token 7d)
```

## 🚀 Inicio Rápido (Desarrollo Local)

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/profe-app.git
cd profe-app

# 2. Backend
cd backend
cp .env.example .env        # Completar variables de entorno
npm install
npm run dev                 # http://localhost:4000

# 3. Frontend (nueva terminal)
cd frontend
cp .env.example .env        # Apuntar a backend local
npm install
npm run dev                 # http://localhost:5173
```

## 🏗️ Estructura de Carpetas

```
profe-app/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── api/            # Axios + interceptors
│   │   ├── components/     # UI reutilizable
│   │   ├── features/       # Módulos por dominio
│   │   │   ├── auth/
│   │   │   ├── courses/
│   │   │   ├── students/
│   │   │   ├── evaluations/
│   │   │   ├── grades/
│   │   │   └── observations/
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Zustand (estado global)
│   │   ├── themes/         # 5 temas de color
│   │   └── utils/          # Helpers (notas, stats)
│   └── package.json
│
├── backend/                # Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
└── docs/                   # Documentación de software
```

---

## 👩‍🏫 Usuarios Objetivo

La app está diseñada para **profesores/as de educación básica y media** chilena. El diseño prioriza:
- Simplicidad — sin curva de aprendizaje
- Mobile-first — funcional desde el celular
- Velocidad — ingresar notas en segundos

## 📌 Versión

`v1.0.0` — MVP inicial  
Escala chilena 1.0 → 7.0 · Nota de aprobación configurable (default 4.0)
