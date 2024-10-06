import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.imitate.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendReminderEmail(to: string, task: Task): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: task.user.email,
      subject: `Reminder: ${task.title}`,
      text: `Don't forget about your task: ${task.title}`,
      html: `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Reminder</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .task-title {
                color: #1a73e8;
                font-size: 24px;
                margin-bottom: 10px;
            }
            .task-details {
                background-color: #f1f3f4;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }
            .category-tag {
                display: inline-block;
                background-color: #34a853;
                color: white;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 12px;
                margin-right: 5px;
            }
            .deadline {
                color: #d93025;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <h1>Task Reminder</h1>
        <p>Hello ${task.user.email.split('@')[0]},</p>
        <p>This is a friendly reminder about your upcoming task:</p>
        <div class="task-details">
            <h2 class="task-title">${task.title}</h2>
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Status:</strong> ${task.status}</p>
            <p><strong>Deadline:</strong> <span class="deadline">${new Date(task.deadline).toLocaleString()}</span></p>
        </div>
        <p>Don't forget to complete this task on time. Good luck!</p>
        <p>Best regards,<br>Your To-Do App Team</p>
    </body>
    </html>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Failed to send reminder email: ${error.message}`);
    }
  }
}
