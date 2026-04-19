# 🔌 API_SPEC.md — ProfeApp REST API
**Base URL:** `https://profe-app-api.onrender.com/api`  
**Formato:** JSON · **Auth:** Bearer Token (JWT)

---

## Convenciones

- Todos los endpoints protegidos requieren header: `Authorization: Bearer <accessToken>`
- Respuestas de éxito: `{ success: true, data: {...} }`
- Respuestas de error: `{ success: false, error: { message: "...", code: "..." } }`
- Paginación: `?page=1&limit=50` donde aplique
- Fechas: ISO 8601 string (`"2026-03-15T00:00:00.000Z"`)

---

## 1. Auth `/api/auth`

### POST `/api/auth/register`
Registrar nuevo usuario. **Público.**

**Body:**
```json
{
  "name": "Antonia Pérez",
  "email": "antonia@colegio.cl",
  "password": "miContraseña123",
  "school": "Colegio San Pedro Apóstol de Paine"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "Antonia Pérez", "email": "...", "theme": "rosa" },
    "accessToken": "eyJhbGci..."
  }
}
```

---

### POST `/api/auth/login`
Login. **Público.** Setea refresh token en cookie httpOnly.

**Body:**
```json
{ "email": "antonia@colegio.cl", "password": "miContraseña123" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "Antonia Pérez", "email": "...", "theme": "rosa", "school": "..." },
    "accessToken": "eyJhbGci..."
  }
}
```

---

### POST `/api/auth/refresh`
Obtener nuevo accessToken usando el refresh token (cookie). **Público.**

**Response 200:**
```json
{ "success": true, "data": { "accessToken": "eyJhbGci..." } }
```

---

### POST `/api/auth/logout`
Cierra sesión. **Protegido.**

**Response 200:**
```json
{ "success": true, "data": { "message": "Sesión cerrada correctamente" } }
```

---

### POST `/api/auth/forgot-password`
Enviar email con link de recuperación. **Público.**

**Body:** `{ "email": "antonia@colegio.cl" }`

**Response 200:**
```json
{ "success": true, "data": { "message": "Email enviado si la cuenta existe" } }
```

---

### POST `/api/auth/reset-password/:token`
Cambiar contraseña con token del email. **Público.**

**Body:** `{ "password": "nuevaContraseña456" }`

**Response 200:**
```json
{ "success": true, "data": { "message": "Contraseña actualizada" } }
```

---

## 2. Users `/api/users`

### GET `/api/users/me`
Perfil del usuario autenticado. **Protegido.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Antonia Pérez",
    "email": "antonia@colegio.cl",
    "school": "Colegio San Pedro Apóstol de Paine",
    "theme": "rosa",
    "gradeConfig": { "minGrade": 1.0, "maxGrade": 7.0, "passGrade": 4.0, "decimals": 1 },
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH `/api/users/me`
Actualizar perfil. **Protegido.**

**Body (campos opcionales):**
```json
{
  "name": "Antonia Sofía Pérez",
  "school": "Colegio San Pedro Apóstol de Paine",
  "theme": "rosa",
  "gradeConfig": { "passGrade": 4.0, "decimals": 1 }
}
```

---

### PATCH `/api/users/me/password`
Cambiar contraseña. **Protegido.**

**Body:**
```json
{ "currentPassword": "actual123", "newPassword": "nueva456" }
```

---

## 3. Courses `/api/courses`

### GET `/api/courses`
Listar cursos del usuario. **Protegido.**

**Query params:** `?status=active&year=2026&page=1&limit=50`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "...",
        "name": "Lenguaje 2°B",
        "subject": "Lenguaje y Comunicación",
        "level": "2° Básico",
        "school": "Colegio San Pedro Apóstol",
        "academicYear": 2026,
        "status": "active",
        "studentCount": 36,
        "evaluationCount": 11,
        "stats": {
          "classAverage": 5.1,
          "passRate": 0.615,
          "studentsWithGrades": 26
        },
        "createdAt": "..."
      }
    ],
    "total": 5,
    "page": 1
  }
}
```

---

### POST `/api/courses`
Crear curso. **Protegido.**

**Body:**
```json
{
  "name": "Lenguaje 2°B",
  "subject": "Lenguaje y Comunicación",
  "level": "2° Básico",
  "school": "Colegio San Pedro Apóstol de Paine",
  "academicYear": 2026,
  "description": "",
  "gradeConfig": { "passGrade": 4.0, "decimals": 1 }
}
```

**Response 201:**
```json
{ "success": true, "data": { "course": { "id": "...", "name": "Lenguaje 2°B", ... } } }
```

---

### GET `/api/courses/:courseId`
Detalle del curso con estadísticas. **Protegido.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "course": { "id": "...", "name": "Lenguaje 2°B", ... },
    "stats": {
      "classAverage": 5.1,
      "median": 5.6,
      "maxGrade": 7.0,
      "minGrade": 3.0,
      "stdDev": 1.4,
      "totalStudents": 36,
      "studentsWithGrades": 26,
      "passed": 16,
      "failed": 10,
      "passRate": 0.615
    }
  }
}
```

---

### PUT `/api/courses/:courseId`
Editar curso completo. **Protegido.**

---

### PATCH `/api/courses/:courseId`
Editar campos específicos (ej: solo status). **Protegido.**

**Body ejemplo:** `{ "status": "archived" }`

---

### DELETE `/api/courses/:courseId`
Eliminar curso (cascade: elimina students, evaluations, grades, observations). **Protegido.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Curso eliminado",
    "deleted": { "students": 36, "evaluations": 11, "grades": 286, "observations": 14 }
  }
}
```

---

### POST `/api/courses/:courseId/duplicate`
Duplicar curso (copia estructura, sin notas). **Protegido.**

**Body:** `{ "name": "Lenguaje 2°B — 2027", "academicYear": 2027 }`

---

## 4. Students `/api/courses/:courseId/students`

### GET `/api/courses/:courseId/students`
Listar alumnos del curso ordenados por N° de lista. **Protegido.**

**Query:** `?status=active`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "...",
        "listNumber": 1,
        "lastName": "Arenas",
        "firstName": "Julieta",
        "fullName": "Arenas Julieta",
        "status": "active",
        "average": null,
        "situacion": "sin_notas"
      },
      {
        "id": "...",
        "listNumber": 3,
        "lastName": "Astorga",
        "firstName": "Gaspar",
        "status": "active",
        "average": 5.3,
        "situacion": "aprobado"
      }
    ],
    "total": 36
  }
}
```

---

### POST `/api/courses/:courseId/students`
Agregar alumno. **Protegido.**

**Body:**
```json
{
  "listNumber": 37,
  "lastName": "Nuevo",
  "firstName": "Alumno",
  "birthDate": null,
  "guardianName": "",
  "guardianPhone": "",
  "guardianEmail": ""
}
```

---

### GET `/api/courses/:courseId/students/:studentId`
Ficha completa del alumno (con todas sus notas y observaciones). **Protegido.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "student": { "id": "...", "listNumber": 3, "lastName": "Astorga", ... },
    "grades": [
      { "evaluationId": "...", "evaluationName": "Plan lector", "weight": 9.1, "value": 5.3, "status": "graded" }
    ],
    "average": 5.3,
    "situacion": "aprobado",
    "observations": [
      { "id": "...", "text": "Participó activamente...", "category": "positiva", "date": "2026-03-10" }
    ]
  }
}
```

---

### PUT `/api/courses/:courseId/students/:studentId`
Editar alumno. **Protegido.**

---

### DELETE `/api/courses/:courseId/students/:studentId`
Eliminar alumno (elimina sus grades y observations). **Protegido.**

---

### POST `/api/courses/:courseId/students/import`
Importar lista desde CSV/Excel. **Protegido.**

**Body:** `multipart/form-data` con campo `file` (xlsx o csv)

**Response 200:**
```json
{
  "success": true,
  "data": { "imported": 36, "skipped": 0, "errors": [] }
}
```

---

## 5. Evaluations `/api/courses/:courseId/evaluations`

### GET `/api/courses/:courseId/evaluations`
Listar evaluaciones del curso ordenadas. **Protegido.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "evaluations": [
      {
        "id": "...",
        "name": "Plan lector \"Grandes amigos\"",
        "type": "trabajo",
        "weight": 9.1,
        "date": "2026-01-15",
        "order": 1,
        "stats": { "average": 5.2, "passRate": 0.65, "gradedCount": 26 }
      }
    ],
    "totalWeight": 100,
    "weightValid": true
  }
}
```

---

### POST `/api/courses/:courseId/evaluations`
Crear evaluación. **Protegido.**

**Body:**
```json
{
  "name": "Prueba Unidad 2",
  "type": "prueba",
  "weight": 15.0,
  "date": "2026-04-20",
  "description": ""
}
```

---

### PUT `/api/courses/:courseId/evaluations/:evalId`
Editar evaluación. **Protegido.**

---

### PATCH `/api/courses/:courseId/evaluations/reorder`
Reordenar evaluaciones. **Protegido.**

**Body:** `{ "order": ["evalId1", "evalId3", "evalId2"] }`

---

### DELETE `/api/courses/:courseId/evaluations/:evalId`
Eliminar evaluación (elimina sus grades). **Protegido.**

---

## 6. Grades `/api/courses/:courseId/grades`

### GET `/api/courses/:courseId/grades`
Obtener TODAS las notas del curso (para la grilla). **Protegido.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "grades": [
      {
        "studentId": "...",
        "evaluationId": "...",
        "value": 5.3,
        "status": "graded"
      }
    ]
  }
}
```

> La grilla se construye en el frontend con este array flat + la lista de students + evaluations.

---

### PUT `/api/courses/:courseId/grades/:studentId/:evalId`
Guardar o actualizar una nota. **Protegido.**

**Body:**
```json
{
  "value": 6.2,
  "status": "graded",
  "note": ""
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "grade": { "studentId": "...", "evaluationId": "...", "value": 6.2, "status": "graded" },
    "studentAverage": 6.2,
    "studentSituacion": "aprobado"
  }
}
```

---

### POST `/api/courses/:courseId/grades/batch`
Guardar múltiples notas de una vez. **Protegido.**

**Body:**
```json
{
  "grades": [
    { "studentId": "...", "evaluationId": "...", "value": 6.2 },
    { "studentId": "...", "evaluationId": "...", "value": 4.8 }
  ]
}
```

---

## 7. Observations `/api/courses/:courseId/students/:studentId/observations`

### GET `/api/courses/:courseId/students/:studentId/observations`
Listar observaciones del alumno. **Protegido.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "observations": [
      {
        "id": "...",
        "text": "Entregó trabajo con retraso. Se habló con apoderada.",
        "category": "academica",
        "date": "2026-03-15"
      }
    ]
  }
}
```

---

### POST `/api/courses/:courseId/students/:studentId/observations`
Agregar observación. **Protegido.**

**Body:**
```json
{
  "text": "Mostró gran mejora en lectura comprensiva este mes.",
  "category": "positiva",
  "date": "2026-04-01"
}
```

---

### PUT `/api/courses/:courseId/students/:studentId/observations/:obsId`
Editar observación. **Protegido.**

---

### DELETE `/api/courses/:courseId/students/:studentId/observations/:obsId`
Eliminar observación. **Protegido.**

---

## 8. Stats & Export `/api/courses/:courseId/stats`

### GET `/api/courses/:courseId/stats`
Estadísticas detalladas del curso. **Protegido.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "classAverage": 5.1, "median": 5.6, "maxGrade": 7.0,
      "minGrade": 3.0, "stdDev": 1.4, "passRate": 0.615,
      "totalStudents": 36, "studentsWithGrades": 26
    },
    "byEvaluation": [
      {
        "evaluationId": "...",
        "name": "Plan lector",
        "average": 5.2,
        "passRate": 0.65,
        "distribution": { "1-2": 3, "2-3": 2, "3-4": 5, "4-5": 4, "5-6": 6, "6-7": 6 }
      }
    ],
    "failed": [
      { "studentId": "...", "name": "Choque Jose", "average": 3.4 }
    ]
  }
}
```

---

### GET `/api/courses/:courseId/export/excel`
Exportar libro de notas en Excel. **Protegido.**

**Response:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`  
**Filename:** `Lenguaje_2B_2026.xlsx`

---

### GET `/api/courses/:courseId/export/pdf`
Exportar libro de notas en PDF. **Protegido.**

**Response:** `application/pdf`  
**Filename:** `Lenguaje_2B_2026.pdf`

---

## 9. Códigos de Error

| Código HTTP | Error Code | Significado |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Datos inválidos en el body |
| 401 | `UNAUTHORIZED` | Sin token o token expirado |
| 403 | `FORBIDDEN` | Token válido pero el recurso no pertenece al usuario |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | N° de lista duplicado, email ya registrado |
| 422 | `INVALID_GRADE` | Nota fuera del rango permitido |
| 429 | `RATE_LIMITED` | Demasiadas solicitudes |
| 500 | `SERVER_ERROR` | Error interno |

**Ejemplo error 400:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos inválidos",
    "details": [
      { "field": "weight", "message": "El porcentaje debe estar entre 0 y 100" }
    ]
  }
}
```
