const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  evaluationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluation', required: true },
  courseId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value:        { type: Number, min: 1.0, max: 7.0, default: null },
  status:       { type: String, enum: ['graded', 'absent', 'exempt', 'pending'], default: 'pending' },
  note:         { type: String, trim: true, maxlength: 200, default: '' }
}, { timestamps: true });

gradeSchema.index({ studentId: 1, evaluationId: 1 }, { unique: true });
gradeSchema.index({ courseId: 1 });
gradeSchema.index({ evaluationId: 1 });
gradeSchema.index({ userId: 1 });

module.exports = mongoose.model('Grade', gradeSchema);
