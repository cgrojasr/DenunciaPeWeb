import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-demo',
  styleUrl: './demo.css',
  templateUrl: './demo.html',
})

export class Demo {
  @Output() mensajeEvent = new EventEmitter<string>();

  onSubmit() {
    this.mensajeEvent.emit('Hello from child component!');
  }
}
