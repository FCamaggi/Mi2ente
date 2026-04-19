const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 100 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['teacher', 'admin'], default: 'teacher' },
  theme:    { type: String, enum: ['rosa', 'oceano', 'bosque', 'noche', 'otono'], default: 'rosa' },
  gradeConfig: {
    minGrade:  { type: Number, default: 1.0 },
    maxGrade:  { type: Number, default: 7.0 },
    passGrade: { type: Number, default: 4.0 },
    decimals:  { type: Number, default: 1, enum: [0, 1, 2] }
  },
  preferences: {
    studentSortOrder:    { type: String, enum: ['listNumber', 'lastName'], default: 'listNumber' },
    defaultEvalType:     { type: String, enum: ['prueba', 'tarea', 'trabajo', 'disertacion', 'otro'], default: 'prueba' },
    showGradeColors:     { type: Boolean, default: true },
    exportFormat:        { type: String, enum: ['excel', 'pdf'], default: 'excel' },
    defaultAcademicYear: { type: Number, default: () => new Date().getFullYear() },
  },
  refreshToken:         { type: String, select: false },
  resetPasswordToken:   { type: String, select: false },
  resetPasswordExpires: { type: Date,   select: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
