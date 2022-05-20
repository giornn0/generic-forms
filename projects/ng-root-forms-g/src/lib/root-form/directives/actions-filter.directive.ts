import { Directive, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector:'[actions-filter]'
})
export class ActionsFilterDirective {

  @Output()changingFocus:EventEmitter<number> =  new EventEmitter()

  delay:Subject<any> = new Subject()


  @HostListener('window:keydown',['$event'])keyEvent(event:KeyboardEvent){
    console.log(event.key)
    if(event.key=='Enter')console.log('cargando')
    if(event.key=='ArrowUp')this.changingFocus.emit(-1)
    if(event.key=='ArrowDown')this.changingFocus.emit(1)
  }
}