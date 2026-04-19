const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  courseId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true, maxlength: 150 },
  type:        { type: String, enum: ['prueba', 'tarea', 'trabajo', 'disertacion', 'otro'], default: 'prueba' },
  weight:      { type: Number, required: true, min: 0, max: 100 },
  groupName:   { type: String, trim: true, maxlength: 120, default: '' },
  groupWeight: { type: Number, min: 0, max: 100, default: null },
  date:        { type: Date, default: null },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  order:       { type: Number, default: 0 }
}, { timestamps: true });

evaluationSchema.index({ courseId: 1, order: 1 });
evaluationSchema.index({ userId: 1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);
