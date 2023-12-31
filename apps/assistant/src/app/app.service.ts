import { Injectable } from '@nestjs/common';
import OpenAI from "openai";

@Injectable()
export class AppService {
  readonly ai = new OpenAI();
  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
