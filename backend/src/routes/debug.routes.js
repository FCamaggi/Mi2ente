const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/auth');

const Course      = require('../models/Course');
const Student     = require('../models/Student');
const Evaluation  = require('../models/Evaluation');
const Grade       = require('../models/Grade');
const Observation = require('../models/Observation');
const School      = require('../models/School');

const SEED_TAG = '[SEED]';

// ── helpers ──────────────────────────────────────────────────────────────────

function rnd(min, max) { return Math.random() * (max - min) + min; }

function grade(avg, spread = 1.2) {
  const raw = avg + (Math.random() - 0.5) * spread * 2;
  return Math.round(Math.min(7, Math.max(1, raw)) * 10) / 10;
}

const FIRST_NAMES = [
  'Sofía','Valentina','Isidora','Catalina','Martina',
  'Agustina','Javiera','Fernanda','Constanza','Camila',
  'Mateo','Sebastián','Nicolás','Diego','Joaquín',
  'Benjamín','Felipe','Ignacio','Tomás','Andrés',
  'Emilia','Florencia','Isabella','Renata','Daniela',
  'Gabriel','Rodrigo','Maximiliano','Cristóbal','Eduardo',
];

const LAST_NAMES = [
  'González','Muñoz','Rodríguez','López','Martínez',
  'García','Pérez','Sánchez','Castro','Romero',
  'Torres','Flores','Díaz','Morales','Jiménez',
  'Herrera','Reyes','Álvarez','Vargas','Fuentes',
  'Navarro','Molina','Ortega','Delgado','Ramírez',
  'Vega','Ramos','Mendoza','Silva','Contreras',
];

function randomName(usedNames) {
  let attempts = 0;
  while (attempts++ < 50) {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last  = LAST_NAMES [Math.floor(Math.random() * LAST_NAMES.length)];
    const key   = `${first}|${last}`;
    if (!usedNames.has(key)) { usedNames.add(key); return { firstName: first, lastName: last }; }
  }
  return { firstName: 'Estudiante', lastName: `#${usedNames.size}` };
}

const OBS_TEMPLATES = [
  { text: 'Excelente participación en clases, demuestra interés constante.', category: 'positiva' },
  { text: 'Entregó tarea atrasada sin justificación.', category: 'conductual' },
  { text: 'Apoderado contactado: solicita reunión para revisar rendimiento.', category: 'apoderado' },
  { text: 'Dificultades para comprender contenido de fracciones, requiere refuerzo.', category: 'academica' },
  { text: 'Actitud disruptiva durante prueba, se le llamó la atención.', category: 'conductual' },
  { text: 'Mejoró significativamente su promedio respecto al período anterior.', category: 'positiva' },
  { text: 'Faltó a evaluación, presentó certificado médico.', category: 'academica' },
  { text: 'Trabaja bien en equipo, liderazgo positivo en trabajo grupal.', category: 'positiva' },
];

// ── seed course definitions ───────────────────────────────────────────────────
// schoolSlot: 'active' | 'inactive'
// Evaluations with groupName/groupWeight demonstrate the group feature.

const COURSES_CONFIG = [
  {
    name: '8°A',
    subject: 'Matemática',
    level: '8° Básico',
    color: '#6366f1',
    schoolSlot: 'active',
    studentCount: 15,
    avgGrade: 5.0,
    evaluations: [
      { name: 'Solemne 1',                  type: 'prueba', weight: 30, order: 0 },
      { name: 'Solemne 2',                  type: 'prueba', weight: 30, order: 1 },
      // Grouped: "Controles" total 20% split equally among 4 controls
      { name: 'Control 1', type: 'prueba', weight: 25, groupName: 'Controles', groupWeight: 20, order: 2 },
      { name: 'Control 2', type: 'prueba', weight: 25, groupName: 'Controles', groupWeight: 20, order: 3 },
      { name: 'Control 3', type: 'prueba', weight: 25, groupName: 'Controles', groupWeight: 20, order: 4 },
      { name: 'Control 4', type: 'prueba', weight: 25, groupName: 'Controles', groupWeight: 20, order: 5 },
      { name: 'Trabajo final', type: 'trabajo', weight: 20, order: 6 },
    ]
  },
  {
    name: '8°B',
    subject: 'Lenguaje y Comunicación',
    level: '8° Básico',
    color: '#ec4899',
    schoolSlot: 'active',
    studentCount: 14,
    avgGrade: 4.8,
    evaluations: [
      { name: 'Prueba de comprensión lectora', type: 'prueba',      weight: 30, order: 0 },
      { name: 'Disertación oral',              type: 'disertacion', weight: 30, order: 1 },
      // Grouped: "Tareas" total 20%
      { name: 'Tarea 1 — Resumen',  type: 'tarea', weight: 50, groupName: 'Tareas', groupWeight: 20, order: 2 },
      { name: 'Tarea 2 — Análisis', type: 'tarea', weight: 50, groupName: 'Tareas', groupWeight: 20, order: 3 },
      { name: 'Trabajo: ensayo argumentativo', type: 'trabajo', weight: 20, order: 4 },
    ]
  },
  {
    name: '6°C',
    subject: 'Ciencias Naturales',
    level: '6° Básico',
    color: '#10b981',
    schoolSlot: 'active',
    studentCount: 12,
    avgGrade: 5.2,
    evaluations: [
      { name: 'Prueba 1 — El cuerpo humano', type: 'prueba',  weight: 40, order: 0 },
      { name: 'Prueba 2 — Ecosistemas',      type: 'prueba',  weight: 40, order: 1 },
      { name: 'Informe de laboratorio',      type: 'trabajo', weight: 20, order: 2 },
    ]
  },
  {
    name: '1°A',
    subject: 'Historia y Geografía',
    level: '1° Medio',
    color: '#f59e0b',
    // This course belongs to the INACTIVE school — shows that inactive school's courses still exist
    schoolSlot: 'inactive',
    studentCount: 16,
    avgGrade: 4.5,
    evaluations: [
      { name: 'Prueba — Civilizaciones antiguas', type: 'prueba',  weight: 30, order: 0 },
      { name: 'Prueba — Edad Media',              type: 'prueba',  weight: 30, order: 1 },
      // Grouped: "Controles de lecturas" 15%
      { name: 'Control 1', type: 'prueba', weight: 50, groupName: 'Controles de lecturas', groupWeight: 15, order: 2 },
      { name: 'Control 2', type: 'prueba', weight: 50, groupName: 'Controles de lecturas', groupWeight: 15, order: 3 },
      { name: 'Trabajo: línea de tiempo', type: 'trabajo', weight: 25, order: 4 },
    ]
  }
];

// ── POST /api/debug/seed ──────────────────────────────────────────────────────

router.post('/seed', verifyToken, async (req, res) => {
  const userId = req.userId;
  const session = await mongoose.startSession();

  try {
    let summary = { schools: 0, courses: 0, students: 0, evaluations: 0, grades: 0, observations: 0 };

    await session.withTransaction(async () => {

      // ── Create schools ───────────────────────────────────────────────────
      const [activeSchool] = await School.create([{
        userId,
        name: 'Colegio San Martín',
        address: 'Av. San Martín 1234, Santiago',
        isActive: true
      }], { session });

      const [inactiveSchool] = await School.create([{
        userId,
        name: 'Colegio Demo Antiguo',
        address: 'Calle Ficticia 567, Providencia',
        isActive: false
      }], { session });

      summary.schools = 2;

      const schoolMap = {
        active:   { id: activeSchool._id,   name: activeSchool.name },
        inactive: { id: inactiveSchool._id, name: inactiveSchool.name },
      };

      // ── Create courses ───────────────────────────────────────────────────
      for (const cfg of COURSES_CONFIG) {
        const { id: schoolId, name: schoolName } = schoolMap[cfg.schoolSlot];

        const [course] = await Course.create([{
          userId,
          name: cfg.name,
          subject: cfg.subject,
          level: cfg.level,
          school: schoolName,
          schoolId,
          academicYear: new Date().getFullYear(),
          description: `${SEED_TAG} Curso de demostración generado automáticamente.`,
          color: cfg.color,
          status: 'active',
          gradeConfig: { minGrade: 1.0, maxGrade: 7.0, passGrade: 4.0, decimals: 1 }
        }], { session });
        summary.courses++;

        // ── Evaluations ──────────────────────────────────────────────────
        const evalDocs = await Evaluation.create(
          cfg.evaluations.map(e => ({
            courseId: course._id,
            userId,
            name:        e.name,
            type:        e.type,
            weight:      e.weight,
            groupName:   e.groupName   || '',
            groupWeight: e.groupWeight ?? null,
            order:       e.order,
            date: new Date(Date.now() - (cfg.evaluations.length - e.order) * 7 * 24 * 3600 * 1000)
          })),
          { session, ordered: true }
        );
        summary.evaluations += evalDocs.length;

        // ── Students + Grades ────────────────────────────────────────────
        const usedNames = new Set();
        const gradesToInsert = [];
        const obsToInsert    = [];

        for (let n = 1; n <= cfg.studentCount; n++) {
          const { firstName, lastName } = randomName(usedNames);
          const studentAvg = cfg.avgGrade + rnd(-0.8, 0.8);

          const [student] = await Student.create([{
            courseId:   course._id,
            userId,
            listNumber: n,
            firstName,
            lastName,
            status: 'active'
          }], { session });
          summary.students++;

          for (const ev of evalDocs) {
            const roll = Math.random();
            let value  = null;
            let status = 'pending';
            if      (roll < 0.05) { status = 'absent'; }
            else if (roll < 0.08) { status = 'exempt'; }
            else                  { value = grade(studentAvg, 1.0); status = 'graded'; }
            gradesToInsert.push({ studentId: student._id, evaluationId: ev._id, courseId: course._id, userId, value, status });
          }

          if (Math.random() < 0.30) {
            const obs = OBS_TEMPLATES[Math.floor(Math.random() * OBS_TEMPLATES.length)];
            obsToInsert.push({
              studentId: student._id, courseId: course._id, userId,
              text: obs.text, category: obs.category,
              date: new Date(Date.now() - rnd(0, 30) * 24 * 3600 * 1000)
            });
          }
        }

        if (gradesToInsert.length) { await Grade.insertMany(gradesToInsert, { session }); summary.grades += gradesToInsert.length; }
        if (obsToInsert.length)    { await Observation.insertMany(obsToInsert, { session }); summary.observations += obsToInsert.length; }
      }
    });

    res.json({ success: true, data: { summary, message: 'Datos de prueba creados correctamente.' } });

  } catch (err) {
    console.error('[seed]', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.endSession();
  }
});

// ── DELETE /api/debug/seed ────────────────────────────────────────────────────

router.delete('/seed', verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const courses = await Course.find({ userId, description: { $regex: `^\\${SEED_TAG}` } }).select('_id schoolId');
    const courseIds = courses.map(c => c._id);
    const schoolIds = [...new Set(courses.map(c => c.schoolId).filter(Boolean).map(String))];

    if (courseIds.length === 0 && schoolIds.length === 0) {
      return res.json({ success: true, data: { deleted: 0, message: 'No hay datos de prueba para eliminar.' } });
    }

    await Promise.all([
      Grade.deleteMany({ courseId: { $in: courseIds } }),
      Observation.deleteMany({ courseId: { $in: courseIds } }),
      Evaluation.deleteMany({ courseId: { $in: courseIds } }),
      Student.deleteMany({ courseId: { $in: courseIds } }),
      Course.deleteMany({ _id: { $in: courseIds } }),
      schoolIds.length ? School.deleteMany({ _id: { $in: schoolIds }, userId }) : Promise.resolve(),
    ]);

    res.json({ success: true, data: { deleted: courseIds.length, message: `${courseIds.length} curso(s) y ${schoolIds.length} colegio(s) de prueba eliminados.` } });

  } catch (err) {
    console.error('[seed reset]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
