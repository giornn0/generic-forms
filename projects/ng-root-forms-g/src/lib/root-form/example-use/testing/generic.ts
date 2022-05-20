import { Component, ElementRef, QueryList, ViewChildren } from "@angular/core";
import { FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector:'generic-child-component',
  template:`
    <form [formGroup]="form">
    <input [formControlName]="'filter'">
    </form>
    <div *ngFor="let option of fetchedOptions">
      <input #optionsInputs >
      {{option}}
    </div>
  `
})
export class GenericDelayComponent {

  @ViewChildren('optionsInputs')optionsInputs:QueryList<ElementRef>

  constructor(private fBuilder:FormBuilder){}

  fetchedOptions=[]

  form: FormGroup = this.fBuilder.group({
    filter:[null]
  })

}