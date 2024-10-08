import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chat',
  standalone: true
})
export class ChatPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
