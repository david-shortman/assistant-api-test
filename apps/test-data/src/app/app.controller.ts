import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('corn')
  getCorn() {
    return { available: [{
        "name": "Corn",
        "quantity": 10
      }] };
  }

  @Get('cook')
    cook() {
        return { available: [{
            "name": "Corn casserole",
            "quantity": 1
            }] };
    }
}
