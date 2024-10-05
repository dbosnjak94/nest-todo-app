import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {
  private readonly logger = new Logger('Health Check');

  @Cron(CronExpression.EVERY_10_SECONDS)
  async logHealthCheck() {
    try {
      this.logger.log(`Health check status: ok`);
    } catch (error) {
      this.logger.error('Health check failed', error.message);
    }
  }
}
