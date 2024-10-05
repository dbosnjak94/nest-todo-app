import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendReminderEmail(to: string, taskTitle: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Task reminder',
      text: `Don't forget about your task: ${taskTitle}`,
      html: `<p>Don't forget about your taskL <strong>${taskTitle}</strong></p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
