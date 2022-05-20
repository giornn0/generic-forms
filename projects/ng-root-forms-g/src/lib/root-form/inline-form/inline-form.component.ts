import { Output, EventEmitter, Input, ViewChild, Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { InputTemplate, } from '../../../shared/models/basic/template.form.model';
import { InitialState, InputComponent, ValuableOption } from '../inputs/inputs.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { QueryList } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { SelectService } from '../../services/select.service';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { ModalService, Action } from '../../../services/modals/modals.service';

@Component({
  selector: 'app-inline-form',
  templateUrl: './inline-form.component.html',
  styleUrls: ['./inline-form.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineFormComponent implements OnInit, OnDestroy {
  @ViewChildren("inputs") inputsRef?: QueryList<InputComponent>;
  @Input()inputs?: InputTemplate[];
  @Input()initialState?: {[x:string]:InitialState}
  @Input()selectOptions: { [x: string]: any[] } = {};
  @Input()inpTemplate?:InputTemplate;
  @Input()value?: any;

  @Output()changedValue: EventEmitter<any>=  new EventEmitter();
  @Output()changedReference: EventEmitter<any>=  new EventEmitter();
  @Output()removedInline: EventEmitter<any>=  new EventEmitter();

  formGroup?:FormGroup;

  openForm = true;
  created: Array<any> =[];
  constructor(private fb: FormBuilder, private selectsService :  SelectService, private cdr: ChangeDetectorRef, private modalService: ModalService) { }
  subscriptions: Subscription = new Subscription();

  selectsOptions: Array<{ [x: string]: any[] }>=[];
  selectedOptions: Array<{ [x: string]: any}>=[];

  ngOnInit(): void {
    if(!this.inpTemplate!.openForm)this.openForm = false;
    this.formGroup = this.fb.group(
      this.initialState!
    )
    if(this.value && Array.isArray(this.value)){
      this.openForm = true;
      this.created = this.value
    }
    // this.subscriptions.add(
    //   this.selectsService.currentInline.subscribe(res=>this.selectsOptions = res)
    // )
    this.subscriptions.add(this.modalService.actionConfirmation.subscribe(
      (action) => {
        if (
          action.type == "delete" &&
          action.section === 'inline-delete' &&
          action?.id != undefined
          ){
          this.remove(action.id!);
        }
          
      }
    ));
  }

  setValue(value: ValuableOption){
    Object.entries(value).forEach(([key,value])=>{
      this.formGroup!.controls[key].setValue(value)
    })
  }
  editValue(value: ValuableOption, index: number){
    Object.entries(value).forEach(([key,value])=>{
      if(key=='id'){
        this.selectedOptions[index]= this.selectOptions['id'].find(option=> option.id ==value)
      }
      this.created[index][key] =  value
    })
    this.changedValue.emit({[this.inpTemplate?.name!]:this.created})
  }

  pushToCreated(){
    if(!this.openForm)this.openForm = true;
    const optionsForthisIndex: {[x: string]:any} = {}
    Object.entries(this.selectOptions).forEach(([key,value])=>{
      optionsForthisIndex[key]=[... value]
    })
    this.selectsOptions.push(optionsForthisIndex)
    // this.selectsService.pushInlineOption(optionsForthisIndex)
    this.created?.push({})
    this.cdr.detectChanges();
    this.changedReference.emit()
  }

  alertForRemove(index:number){
    const action:Action = {type:'delete',id:index,section: 'inline-delete'}
    this.modalService.setModal('danger',`Eliminando ..`,`¿Está seguro que desea eliminar?`,action)
  }

  remove(index:number){
    this.removedInline.emit(this.created[index]);
    this.created.splice(index,1)
    this.selectsOptions.splice(index,1)
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
