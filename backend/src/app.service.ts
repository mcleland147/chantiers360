import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'chantiers360-api',
      timestamp: new Date().toISOString(),
    };
  }
}
