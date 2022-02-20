import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { EngineService } from './engine.service';

@Component({
  selector: 'jhi-app-engine',
  templateUrl: './engine.component.html',
  styleUrls: ['./engine.component.scss'],
})
export class EngineComponent implements OnInit {
  @Output() newEvent = new EventEmitter<string>();
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  public constructor(private engServ: EngineService) {
    engServ.appName.subscribe(value => {
      console.log(value);
      this.newEvent.emit(value);
    });
  }

  public ngOnInit(): void {
    this.engServ.createScene(this.rendererCanvas);
    this.engServ.animate();
  }
}
