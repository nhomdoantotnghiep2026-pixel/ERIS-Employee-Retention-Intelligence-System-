import nodemailer from 'nodemailer';
export function createResetMailer(config) {
  const smtp = config.smtp;
  if (!smtp?.host || !smtp?.from || !config.auth?.resetUrl) return { configured: false };
  const transport = nodemailer.createTransport({ host: smtp.host, port: smtp.port, secure: smtp.secure,
    requireTLS: !smtp.secure,
    ...(smtp.user ? { auth: { user: smtp.user, pass: smtp.password } } : {}),
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000, logger: false, debug: false });
  return {
    configured: true,
    async sendReset(email, token) {
      // Trusted configuration only, never a user-supplied redirect or Host header.
      const url = new URL(config.auth.resetUrl);
      url.searchParams.set('token', token);
      await transport.sendMail({ from: smtp.from, to: email, subject: 'ERIS — Reset your password',
        text: `Use this link to reset your ERIS password:\n${url.href}\n\nThe link expires in ${Math.ceil(config.auth.resetTtlSeconds / 60)} minutes and can be used once. If you did not request this, ignore this email.` });
    },
  };
}
