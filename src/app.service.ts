import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {
  // @Cron(CronExpression.EVERY_MINUTE)
  // async logHealthCheck() {
  //   try {
  //     const response = await axios.get('http://localhost:3000/health');
  //     this.logger.log(`Health check status: ${JSON.stringify(response.data)}`);
  //   } catch (error) {
  //     this.logger.error('Health check failed', error);
  //   }
  // }
}
