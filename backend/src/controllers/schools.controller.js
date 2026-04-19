const School = require('../models/School');

async function list(req, res, next) {
  try {
    const schools = await School.find({ userId: req.userId }).sort({ isActive: -1, createdAt: 1 });
    res.json({ success: true, data: { schools } });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, address } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'El nombre del colegio es requerido' }
      });
    }
    const school = await School.create({
      name: name.trim(),
      address: address?.trim() || '',
      userId: req.userId,
      isActive: true
    });
    res.status(201).json({ success: true, data: { school } });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { name, address, isActive } = req.body;
    const patch = {};
    if (name !== undefined) patch.name = name.trim();
    if (address !== undefined) patch.address = address.trim();
    if (isActive !== undefined) patch.isActive = isActive;

    const school = await School.findOneAndUpdate(
      { _id: req.params.schoolId, userId: req.userId },
      patch,
      { new: true, runValidators: true }
    );
    if (!school) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Colegio no encontrado' }
      });
    }
    res.json({ success: true, data: { school } });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const school = await School.findOneAndDelete({
      _id: req.params.schoolId,
      userId: req.userId
    });
    if (!school) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Colegio no encontrado' }
      });
    }
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };
