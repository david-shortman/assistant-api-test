import { AppService } from './app.service';
import {MessageBody, SubscribeMessage, WebSocketGateway, WsResponse} from "@nestjs/websockets";
import {from, map, Observable, of, switchMap, tap,} from "rxjs";
import OpenAI from "openai";
import ChatCompletionTool = OpenAI.ChatCompletionTool;

@WebSocketGateway()
export class AppGateway {
  constructor(private readonly appService: AppService) {}

  private readonly tools: Array<ChatCompletionTool> = [
    {
      type: "function",
      function: {
        name: "get_corn",
        description: "Gets available corn cobs from the pantry",
        parameters: {
          type: "object",
          properties: {
            needed_quantity: {
              type: "number",
              description: "The number of cobs you want to cook",
            },
          },
          required: [],
        }
      }
    },
    {
      type: "function",
      function: {
        name: "cook_casserole",
        description: "Cooks corn into a casserole",
        parameters: {
          type: "object",
          properties: {
            corn: {
              type: "array",
              items: {
                id: {
                  type: "number",
                  description: "The id of a cob from the pantry to cook",
                },
              },
            }
          },
        }
      }
    }
  ];

  @SubscribeMessage('events')
  handleEvent(@MessageBody() {data}: { data: string}): Observable<WsResponse<string>> {
    console.log(data);
    const initialMessage = { role: "assistant",
      content: "You're a chef who cooks straight up corn into casserole. Now then: " + data }
    const messages: any[] = [initialMessage];

    return from(this.appService.ai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      tools: this.tools,
    })).pipe(
        map(comp => {
          const response = comp.choices[0].message;
          const toolCalls = comp.choices[0].message.tool_calls;
          const [toolCall] = toolCalls;
          let toolResult;
          if (toolCall) {
            if (toolCall.function.name === 'get_corn') {
              toolResult = this.get_corn(toolCall.function.arguments['needed_quantity']);
            } else if (toolCall.function.name === 'cook_casserole') {
              toolResult = this.cook_casserole(toolCall.function.arguments['corn']);
            }
          }
          console.log(toolResult)
          const updated: Array<any> = [initialMessage, response, ...(toolResult ? [ {
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: toolResult,
          }] : [])];
          return updated;
        }),
        switchMap(mes => {
          return from(this.appService.ai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: mes,
            tools: this.tools,
          })).pipe(
              map(comp => {
                return { event: 'events', data: comp.choices[0].message.content }
              })
          )
        })
    );
  }

    get_corn(needed_quantity: number): string {
        return 'There were 10 cobs of corn in the pantry';
    }

    cook_casserole(corn: Array<{id: number}>): string {
        return `You cooked a casserole with ${corn.length} cobs of corn`;
    }
}
