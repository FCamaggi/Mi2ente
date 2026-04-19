const { body, param } = require('express-validator');

const emailField = body('email')
  .trim()
  .isEmail()
  .withMessage('Ingresa un email válido')
  .normalizeEmail();

const passwordField = (field = 'password', label = 'La contraseña') =>
  body(field)
    .isString()
    .withMessage(`${label} es requerida`)
    .isLength({ min: 6 })
    .withMessage(`${label} debe tener al menos 6 caracteres`);

const gradeConfigFields = [
  body('gradeConfig.minGrade')
    .optional()
    .isFloat({ min: 1, max: 7 })
    .withMessage('La nota mínima debe estar entre 1.0 y 7.0'),
  body('gradeConfig.maxGrade')
    .optional()
    .isFloat({ min: 1, max: 7 })
    .withMessage('La nota máxima debe estar entre 1.0 y 7.0'),
  body('gradeConfig.passGrade')
    .optional()
    .isFloat({ min: 1, max: 7 })
    .withMessage('La nota de aprobación debe estar entre 1.0 y 7.0'),
  body('gradeConfig.decimals')
    .optional()
    .isInt({ min: 0, max: 2 })
    .withMessage('Los decimales deben ser 0, 1 o 2')
];

const authValidators = {
  register: [
    body('name').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }).withMessage('El nombre es demasiado largo'),
    emailField,
    passwordField(),
    body('school').optional().trim().isLength({ max: 200 }).withMessage('El colegio es demasiado largo')
  ],
  login: [
    emailField,
    body('password').isString().notEmpty().withMessage('La contraseña es requerida')
  ],
  forgotPassword: [emailField],
  resetPassword: [
    param('token').trim().notEmpty().withMessage('El token es requerido'),
    passwordField()
  ]
};

const courseValidators = {
  createOrUpdate: [
    body('name').optional().trim().notEmpty().withMessage('El nombre del curso es requerido').isLength({ max: 100 }).withMessage('El nombre del curso es demasiado largo'),
    body('subject').optional().trim().isLength({ max: 100 }).withMessage('La asignatura es demasiado larga'),
    body('level').optional().trim().isLength({ max: 50 }).withMessage('El nivel es demasiado largo'),
    body('school').optional().trim().isLength({ max: 200 }).withMessage('El colegio es demasiado largo'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('La descripción es demasiado larga'),
    body('academicYear').optional().isInt({ min: 2000, max: 2099 }).withMessage('El año académico debe estar entre 2000 y 2099'),
    body('status').optional().isIn(['active', 'archived']).withMessage('El estado del curso es inválido'),
    ...gradeConfigFields,
    body('gradeConfig').optional().custom((_, { req }) => {
      const config = req.body.gradeConfig || {};
      const min = config.minGrade;
      const max = config.maxGrade;
      const pass = config.passGrade;

      if (min !== undefined && max !== undefined && Number(min) >= Number(max)) {
        throw new Error('La nota mínima debe ser menor a la máxima');
      }
      if (pass !== undefined && min !== undefined && Number(pass) < Number(min)) {
        throw new Error('La nota de aprobación no puede ser menor a la mínima');
      }
      if (pass !== undefined && max !== undefined && Number(pass) > Number(max)) {
        throw new Error('La nota de aprobación no puede ser mayor a la máxima');
      }

      return true;
    })
  ]
};

const studentValidators = {
  createOrUpdate: [
    body('listNumber').optional().isInt({ min: 1 }).withMessage('El número de lista debe ser mayor a 0'),
    body('lastName').optional().trim().notEmpty().withMessage('El apellido es requerido').isLength({ max: 100 }).withMessage('El apellido es demasiado largo'),
    body('firstName').optional().trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }).withMessage('El nombre es demasiado largo'),
    body('guardianEmail').optional({ values: 'falsy' }).isEmail().withMessage('El email del apoderado no es válido').normalizeEmail(),
    body('status').optional().isIn(['active', 'withdrawn']).withMessage('El estado del alumno es inválido')
  ],
  importFile: [
    body().custom((_, { req }) => {
      if (!req.file) throw new Error('Archivo requerido');
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv'
      ];
      if (req.file.mimetype && !allowedTypes.includes(req.file.mimetype)) {
        throw new Error('El archivo debe ser .xlsx, .xls o .csv');
      }
      return true;
    })
  ]
};

const gradeValidators = {
  upsert: [
    body('status').optional().isIn(['graded', 'absent', 'exempt', 'pending']).withMessage('El estado de la nota es inválido'),
    body('value')
      .custom((value, { req }) => {
        if (req.body.status && req.body.status !== 'graded') return true;
        if (value === null || value === undefined || value === '') return true;
        const parsed = Number(value);
        if (Number.isNaN(parsed) || parsed < 1 || parsed > 7) throw new Error('La nota debe estar entre 1.0 y 7.0');
        return true;
      }),
    body('note').optional().isString().isLength({ max: 200 }).withMessage('La observación es demasiado larga')
  ]
};

const evaluationValidators = {
  createOrUpdate: [
    body('name').optional().trim().notEmpty().withMessage('El nombre de la evaluación es requerido').isLength({ max: 150 }).withMessage('El nombre es demasiado largo'),
    body('type').optional().isIn(['prueba', 'tarea', 'trabajo', 'disertacion', 'otro']).withMessage('El tipo es inválido'),
    body('weight').optional().isFloat({ min: 0, max: 100 }).withMessage('La ponderación interna debe estar entre 0 y 100'),
    body('groupName').optional().trim().isLength({ max: 120 }).withMessage('El nombre del grupo es demasiado largo'),
    body('groupWeight').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('La ponderación del grupo debe estar entre 0 y 100'),
    body().custom((_, { req }) => {
      if (req.body.groupName && (req.body.groupWeight === null || req.body.groupWeight === undefined || req.body.groupWeight === '')) {
        throw new Error('Si usas grupo, debes indicar la ponderación del grupo');
      }
      return true;
    })
  ]
};

module.exports = {
  authValidators,
  courseValidators,
  studentValidators,
  gradeValidators,
  evaluationValidators
};
