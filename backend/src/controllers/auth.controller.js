const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/email.service');

function signAccess(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  });
}

function signRefresh(userId) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

async function register(req, res, next) {
  try {
    const { name, email, password, school } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'El email ya está registrado' } });

    const user = await User.create({ name, email, password, school });
    const accessToken = signAccess(user._id, user.role);
    const refreshToken = signRefresh(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, theme: user.theme, school: user.school }, accessToken } });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Credenciales incorrectas' } });
    }

    const accessToken = signAccess(user._id, user.role);
    const refreshToken = signRefresh(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });
    setRefreshCookie(res, refreshToken);

    res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, theme: user.theme, school: user.school }, accessToken } });
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Refresh token requerido' } });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Refresh token inválido' } });
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Sesión inválida' } });
    }

    const accessToken = signAccess(user._id, user.role);
    res.json({ success: true, data: { accessToken } });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.userId, { refreshToken: null });
    res.clearCookie('refreshToken');
    res.json({ success: true, data: { message: 'Sesión cerrada correctamente' } });
  } catch (err) { next(err); }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always return success to avoid user enumeration
    if (!user) return res.json({ success: true, data: { message: 'Email enviado si la cuenta existe' } });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await User.findByIdAndUpdate(user._id, { resetPasswordToken: token, resetPasswordExpires: expires });
    await emailService.sendResetPassword(user.email, user.name, token);

    res.json({ success: true, data: { message: 'Email enviado si la cuenta existe' } });
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Token inválido o expirado' } });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, data: { message: 'Contraseña actualizada' } });
  } catch (err) { next(err); }
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword };
