import nodemailer from 'nodemailer';

export function createResetMailer(config) {
  const smtp = config.smtp;
  if (!smtp?.host || !smtp?.from) return { configured: false };
  const transport = nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.secure,
    requireTLS: !smtp.secure,
    ...(smtp.user ? { auth: { user: smtp.user, pass: smtp.password } } : {}),
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000, logger: false, debug: false });
  return {
    configured: true,
    async sendWelcome(email, password) {
      await transport.sendMail({ from: smtp.from, to: email, subject: 'Your ERIS account',
        text: `Your ERIS account has been created.\n\nEmail: ${email}\nTemporary password: ${password}\n\nSign in and change this temporary password before using ERIS.` });
    },
    async sendReset(email, otp) {
      await transport.sendMail({ from: smtp.from, to: email, subject: 'ERIS - Password reset code',
        text: `Your ERIS password reset code is: ${otp}\n\nThe code expires in ${Math.ceil(config.auth.otpTtlSeconds / 60)} minutes and can be used once. If you did not request this, ignore this email.` });
    },
    async sendPasswordChangeOtp(email, otp) {
      await transport.sendMail({ from: smtp.from, to: email, subject: 'ERIS - Password change code',
        text: `Your ERIS password change code is: ${otp}\n\nThe code expires in ${Math.ceil(config.auth.otpTtlSeconds / 60)} minutes and can be used once. If you did not request this, contact your administrator.` });
    },
  };
}
