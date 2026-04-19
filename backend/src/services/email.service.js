const nodemailer = require('nodemailer');

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
}

async function sendResetPassword(email, name, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"ProfeApp" <no-reply@profeapp.com>',
    to: email,
    subject: 'Recuperar contraseña — ProfeApp',
    html: `
      <h2>Hola, ${name}</h2>
      <p>Recibiste este email porque solicitaste restablecer tu contraseña.</p>
      <p><a href="${resetUrl}" style="background:#ec4899;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Restablecer contraseña</a></p>
      <p>Este link expira en 1 hora.</p>
      <p>Si no solicitaste esto, ignora este email.</p>
    `
  });
}

module.exports = { sendResetPassword };
