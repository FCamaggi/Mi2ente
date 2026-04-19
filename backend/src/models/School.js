const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:     { type: String, required: true, trim: true, maxlength: 200 },
  address:  { type: String, trim: true, maxlength: 300, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

schoolSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('School', schoolSchema);
