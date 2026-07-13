const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true, maxlength: 80 },
  weight: { type: Number, required: true, min: 0, max: 100 },
  order:  { type: Number, required: true, min: 0 }
}, { _id: true });

const courseSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:         { type: String, required: true, trim: true, maxlength: 100 },
  subject:      { type: String, trim: true, maxlength: 100, default: '' },
  level:        { type: String, trim: true, maxlength: 50, default: '' },
  school:       { type: String, trim: true, maxlength: 200, default: '' },
  schoolId:     { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
  academicYear: { type: Number, default: () => new Date().getFullYear() },
  description:  { type: String, trim: true, maxlength: 500, default: '' },
  gradeConfig: {
    minGrade:  { type: Number, default: 1.0 },
    maxGrade:  { type: Number, default: 7.0 },
    passGrade: { type: Number, default: 4.0 },
    decimals:  { type: Number, default: 1, enum: [0, 1, 2] }
  },
  periods: { type: [periodSchema], default: [] },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  color:  { type: String, default: null }
}, { timestamps: true });

courseSchema.path('periods').validate((periods) => {
  if (!periods?.length) return false;
  const total = periods.reduce((sum, period) => sum + Number(period.weight || 0), 0);
  return Math.abs(total - 100) < 0.1;
}, 'El curso debe tener períodos cuyas ponderaciones sumen 100%');

courseSchema.index({ userId: 1, status: 1 });
courseSchema.index({ userId: 1, academicYear: 1 });

module.exports = mongoose.model('Course', courseSchema);
