import { Injectable, Logger } from '@nestjs/common';
import Pusher from 'pusher';
import * as nodemailer from 'nodemailer';

// Wraps Pusher (realtime pool/ride updates) and Nodemailer (ride
// confirmation/cancellation email). Both are optional at runtime: if the
// corresponding env vars are missing (e.g. running the challenge without a
// free Pusher/SMTP sandbox wired up), calls just log instead of throwing,
// so the core booking flow never breaks because a side-integration isn't configured.
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('Notifications');
  private pusher: Pusher | null = null;
  private mailer: nodemailer.Transporter | null = null;

  constructor() {
    if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
      this.pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.PUSHER_CLUSTER ?? 'ap2',
        useTLS: true,
      });
    }

    if (process.env.MAIL_HOST && process.env.MAIL_USER) {
      this.mailer = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT ?? 587),
        auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD },
      });
    }
  }

  // Frontend subscribes to channel `pool-${poolId}` and listens for event
  // `status-update`, refreshing seat counts / ride status live.
  notifyPoolUpdate(poolId: string, event: string) {
    if (!this.pusher) {
      this.logger.debug(`[pusher disabled] pool ${poolId} -> ${event}`);
      return;
    }
    this.pusher.trigger(`pool-${poolId}`, 'status-update', { poolId, event, at: new Date().toISOString() });
  }

  async sendRideCompletedEmail(toEmail: string, poolId: string) {
    if (!this.mailer) {
      this.logger.debug(`[mail disabled] would email ${toEmail} about pool ${poolId} completion`);
      return;
    }
    await this.mailer.sendMail({
      from: process.env.MAIL_FROM ?? 'no-reply@teslapool.example',
      to: toEmail,
      subject: 'Your Dhaka Tesla Pool ride is complete',
      text: `Your ride (pool ${poolId}) has been marked completed. Thanks for riding with us!`,
    });
  }
}
