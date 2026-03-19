import { Injectable } from '@nestjs/common';

export type HealthResponse = {
  service: 'backend';
  status: 'ok';
  timestamp: string;
};

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      service: 'backend',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
