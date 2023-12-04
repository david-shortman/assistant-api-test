import {Component, inject} from '@angular/core';
import { RouterModule } from '@angular/router';
import {Socket} from "ngx-socket-io";
import { toSignal} from "@angular/core/rxjs-interop";
import {map, merge, Subject} from "rxjs";

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'my-workspace-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly socket = inject(Socket);

  private readonly pending = new Subject<void>();
  readonly response = toSignal(merge(this.socket.fromEvent<string>('events').pipe(
    map((data) => data)
  ), this.pending));

  sayHello(text:string) {
    console.log('emit')
    this.socket.emit('events', {data: text});
    this.pending.next();
  }
}
