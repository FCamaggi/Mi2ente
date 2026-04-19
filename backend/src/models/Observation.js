const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  courseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:      { type: String, required: true, trim: true, maxlength: 2000 },
  category:  { type: String, enum: ['academica', 'conductual', 'positiva', 'apoderado', 'otro'], default: 'academica' },
  date:      { type: Date, default: Date.now }
}, { timestamps: true });

observationSchema.index({ studentId: 1, date: -1 });
observationSchema.index({ userId: 1 });

module.exports = mongoose.model('Observation', observationSchema);
