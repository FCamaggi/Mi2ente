const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  courseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listNumber:    { type: Number, required: true, min: 1 },
  lastName:      { type: String, required: true, trim: true, maxlength: 100 },
  firstName:     { type: String, required: true, trim: true, maxlength: 100 },
  birthDate:     { type: Date, default: null },
  guardianName:  { type: String, trim: true, maxlength: 100, default: '' },
  guardianPhone: { type: String, trim: true, maxlength: 20, default: '' },
  guardianEmail: { type: String, trim: true, lowercase: true, default: '' },
  internalNotes: { type: String, trim: true, maxlength: 1000, default: '' },
  photoUrl:      { type: String, default: null },
  status:        { type: String, enum: ['active', 'withdrawn'], default: 'active' }
}, { timestamps: true });

studentSchema.index({ courseId: 1, listNumber: 1 }, { unique: true });
studentSchema.index({ courseId: 1, status: 1 });
studentSchema.index({ userId: 1 });
studentSchema.index({ lastName: 'text', firstName: 'text' });

studentSchema.virtual('fullName').get(function() {
  return `${this.lastName} ${this.firstName}`;
});

module.exports = mongoose.model('Student', studentSchema);
