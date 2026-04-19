const User = require('../models/User');

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Usuario no encontrado' } });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function updateMe(req, res, next) {
  try {
    const allowed = ['name', 'theme', 'gradeConfig', 'preferences'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Contraseña actual incorrecta' } });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, data: { message: 'Contraseña actualizada' } });
  } catch (err) { next(err); }
}

module.exports = { getMe, updateMe, changePassword };
