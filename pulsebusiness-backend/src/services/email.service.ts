import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_ADDRESS = process.env.MAIL_FROM || '"PulseBusiness" <noreply@pulsebusiness.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

const secure = SMTP_PORT === 465; // true for port 465

const transportOptions: any = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure,
  tls: {
    // during development some SMTP servers use self-signed certs
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
};

if (SMTP_USER) {
  transportOptions.auth = {
    user: SMTP_USER,
    pass: SMTP_PASS,
  };
}

const transporter = nodemailer.createTransport(transportOptions);

// Utility to verify SMTP config at startup
export const verifyTransporter = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    // eslint-disable-next-line no-console
    console.info('SMTP transporter verified');
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('SMTP transporter verification failed:', err);
    return false;
  }
};

const sendMailSafe = async (mailOptions: nodemailer.SendMailOptions) => {
  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to send email:', err);
    throw err;
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  return sendMailSafe({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Bienvenue sur PulseBusiness !',
    html: `<h1>Bienvenue ${name} !</h1><p>Votre compte a été créé avec succès.</p>`,
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${FRONTEND_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  return sendMailSafe({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `<p>Cliquez sur ce lien pour réinitialiser votre mot de passe : <a href="${resetLink}">${resetLink}</a></p>`,
  });
};