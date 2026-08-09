import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // GET /health
  // Returns a small JSON payload proving the server is up and responding.
  // No dependency on the database yet — this just confirms the API process itself is alive.
  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
