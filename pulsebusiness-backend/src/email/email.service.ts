import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: parseInt(this.configService.get('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    await this.transporter.sendMail({
      from: '"PulseBusiness" <noreply@pulsebusiness.com>',
      to: email,
      subject: 'Bienvenue sur PulseBusiness !',
      html: `<h1>Bienvenue ${name} !</h1><p>Votre compte a été créé avec succès.</p>`,
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetLink = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: '"PulseBusiness" <noreply@pulsebusiness.com>',
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Cliquez sur ce lien pour réinitialiser votre mot de passe : <a href="${resetLink}">${resetLink}</a></p>`,
    });
  }
}