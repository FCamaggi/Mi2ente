# 🗄️ DATA_MODELS.md — ProfeApp
**Esquemas Mongoose · MongoDB Atlas**

---

## 1. User

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false           // nunca se devuelve en queries por defecto
  },
  role: {
    type: String,
    enum: ['teacher', 'admin'],
    default: 'teacher'
  },
  school: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  theme: {
    type: String,
    enum: ['rosa', 'oceano', 'bosque', 'noche', 'otono'],
    default: 'rosa'
  },
  // Configuración global de notas (puede sobreescribirse por curso)
  gradeConfig: {
    minGrade:      { type: Number, default: 1.0 },
    maxGrade:      { type: Number, default: 7.0 },
    passGrade:     { type: Number, default: 4.0 },
    decimals:      { type: Number, default: 1, enum: [0, 1, 2] }
  },
  refreshToken: {
    type: String,
    select: false
  },
  resetPasswordToken:   { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// No devolver campos sensibles en JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
```

**Índices:**
```javascript
userSchema.index({ email: 1 }, { unique: true });
```

---

## 2. Course

```javascript
// models/Course.js
const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
    // Ej: "Lenguaje 2°B", "Matemática 1°A"
  },
  subject: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
    // Ej: "Lenguaje y Comunicación", "Matemática"
  },
  level: {
    type: String,
    trim: true,
    maxlength: 50,
    default: ''
    // Ej: "2° Básico", "1° Medio"
  },
  school: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  academicYear: {
    type: Number,
    default: () => new Date().getFullYear()
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  // Configuración de notas específica del curso
  // Si null, hereda de User.gradeConfig
  gradeConfig: {
    minGrade:  { type: Number, default: 1.0 },
    maxGrade:  { type: Number, default: 7.0 },
    passGrade: { type: Number, default: 4.0 },
    decimals:  { type: Number, default: 1, enum: [0, 1, 2] }
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  color: {
    type: String,
    default: null
    // Color de acento opcional para la tarjeta del curso
  }
}, {
  timestamps: true
});
```

**Índices:**
```javascript
courseSchema.index({ userId: 1, status: 1 });
courseSchema.index({ userId: 1, academicYear: 1 });
```

---

## 3. Student

```javascript
// models/Student.js
const studentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // Desnormalizado para facilitar autorización sin join
  },
  listNumber: {
    type: Number,
    required: true,
    min: 1
    // N° de lista, único dentro del curso
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  // Datos opcionales
  birthDate: {
    type: Date,
    default: null
  },
  guardianName: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  guardianPhone: {
    type: String,
    trim: true,
    maxlength: 20,
    default: ''
  },
  guardianEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  internalNotes: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  photoUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'withdrawn'],   // activo | retirado
    default: 'active'
  }
}, {
  timestamps: true
});
```

**Índices:**
```javascript
// Único: un alumno no puede tener dos N° de lista en el mismo curso
studentSchema.index({ courseId: 1, listNumber: 1 }, { unique: true });
studentSchema.index({ courseId: 1, status: 1 });
studentSchema.index({ userId: 1 });
// Búsqueda por nombre (text search)
studentSchema.index({ lastName: 'text', firstName: 'text' });
```

**Campo virtual — nombre completo:**
```javascript
studentSchema.virtual('fullName').get(function() {
  return `${this.lastName} ${this.firstName}`;
});
```

---

## 4. Evaluation

```javascript
// models/Evaluation.js
const evaluationSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
    // Ej: "Plan Lector - Grandes Amigos", "Prueba Unidad 1"
  },
  type: {
    type: String,
    enum: ['prueba', 'tarea', 'trabajo', 'disertacion', 'otro'],
    default: 'prueba'
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100
    // % ponderación. La suma de todos los weights del curso debería = 100
  },
  date: {
    type: Date,
    default: null
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  order: {
    type: Number,
    default: 0
    // Para ordenar evaluaciones (drag & drop)
  }
}, {
  timestamps: true
});
```

**Índices:**
```javascript
evaluationSchema.index({ courseId: 1, order: 1 });
evaluationSchema.index({ userId: 1 });
```

---

## 5. Grade

```javascript
// models/Grade.js
const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  evaluationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluation',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  value: {
    type: Number,
    min: 1.0,
    max: 7.0,
    default: null
    // null = sin nota
  },
  status: {
    type: String,
    enum: ['graded', 'absent', 'exempt', 'pending'],
    default: 'pending'
    // graded = tiene nota
    // absent = ausente (no rinde)
    // exempt = exento/a
    // pending = sin nota aún
  },
  note: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
    // Observación corta sobre esta nota específica
  }
}, {
  timestamps: true
});
```

**Índices:**
```javascript
// El par (studentId, evaluationId) es único — una nota por alumno por evaluación
gradeSchema.index({ studentId: 1, evaluationId: 1 }, { unique: true });
gradeSchema.index({ courseId: 1 });
gradeSchema.index({ evaluationId: 1 });
gradeSchema.index({ userId: 1 });
```

**Estrategia de upsert:**
```javascript
// Al guardar/editar una nota, usar findOneAndUpdate con upsert: true
await Grade.findOneAndUpdate(
  { studentId, evaluationId },
  { value, status: 'graded', courseId, userId },
  { upsert: true, new: true, runValidators: true }
);
```

---

## 6. Observation

```javascript
// models/Observation.js
const observationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['academica', 'conductual', 'positiva', 'apoderado', 'otro'],
    default: 'academica'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
```

**Índices:**
```javascript
observationSchema.index({ studentId: 1, date: -1 });
observationSchema.index({ userId: 1 });
```

---

## 7. Resumen de Colecciones

| Colección | Documentos esperados | Notas |
|---|---|---|
| `users` | Decenas a miles | 1 doc por profesor/a |
| `courses` | 3-15 por usuario | Cursos de uno o varios años |
| `students` | 10-45 por curso | ~200 por usuario típico |
| `evaluations` | 4-12 por curso | ~50 por usuario típico |
| `grades` | students × evals | ~2,000 por usuario típico |
| `observations` | Variable | 0-50+ por alumno |

Con M0 de Atlas (512 MB), caben **miles de usuarios** cómodamente.

---

## 8. Datos de Ejemplo — Curso "Lenguaje 2°B"

### Course doc:
```json
{
  "_id": "...",
  "userId": "...",
  "name": "Lenguaje 2°B",
  "subject": "Lenguaje y Comunicación",
  "level": "2° Básico",
  "school": "Colegio San Pedro Apóstol de Paine",
  "academicYear": 2026,
  "gradeConfig": { "passGrade": 4.0, "decimals": 1 },
  "status": "active"
}
```

### Student doc:
```json
{
  "_id": "...",
  "courseId": "...",
  "userId": "...",
  "listNumber": 3,
  "lastName": "Astorga",
  "firstName": "Gaspar",
  "status": "active"
}
```

### Evaluation doc:
```json
{
  "_id": "...",
  "courseId": "...",
  "userId": "...",
  "name": "Plan lector \"Grandes amigos\"",
  "type": "trabajo",
  "weight": 9.1,
  "date": "2026-01-15",
  "order": 1
}
```

### Grade doc:
```json
{
  "_id": "...",
  "studentId": "...",
  "evaluationId": "...",
  "courseId": "...",
  "userId": "...",
  "value": 5.3,
  "status": "graded"
}
```
