import { Location } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  Validators,
  ValidatorFn,
} from "@angular/forms";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { AlertsService } from "../../services/alerts/alerts.service";
import { RootService } from "../services/root.service";
import { InputTemplate, InputTypes } from '../models/basic/template.form.model';
import { FilterComponent } from "../filter/filter.component";
import { FileInput } from "./fileInput/file-input.component";
import { InlineFormComponent } from "./inline-form/inline-form.component";
import {
  InputComponent,
  InitialState,
  ValuableOption,
} from "./inputs/inputs.component";
import { CONFIG, MODULE_CONFIG } from "../ng-root-forms-g.module";

@Component({
  selector: "app-root-form",
  templateUrl: "./root-form.component.html",
  styleUrls: ["../../app.component.css"],
})
export class RootFormComponent implements OnInit {
  @Input() section = "";
  @Input() prefix?: string;
  @Input() forLookErrors?: string[];
  @Input() APIroute?: string;
  @Input() camps: string[] = [];
  @Input() forEdit: any | undefined;
  @Input() title = "";
  @Input() wantActions = true;
  @Input() wantTitle = true;
  @Input() wantRequiredLeyend = true;
  @Input() onlyEmittValue = false;

  @Input() routeForReroute: string | null = null;
  @Input() FileRoute?: { [x: string]: string };
  @Input() maxFileSize = "2MB";

  @Input() reRoute = false;
  @Input() disableIfInvalid = false;

  @Input() selectOptions: { [x: string]: any[] } = {};

  @Input() template: Array<InputTemplate[]> = [];

  @Input() InlineTemplates?: { [x: string]: InputTemplate[] };
  @Input() InlineStates?: { [x: string]:{ [key:string]:InitialState} };

  @Input()defaultType: InputTypes = InputTypes.Input

  useProjectRoutes = "";
  @Input() loadTemplate = true;
  @Input() evento = false;

  warnedCamps: BehaviorSubject<string[]> = new BehaviorSubject(
    new Array<string>()
  );

  fileType = InputTypes.File;
  filterType = InputTypes.Filter;
  inlineFormType = InputTypes.ILForm;

  form: FormGroup = new FormGroup({
    id: new FormControl(),
  });

  validForm = false;

  @Input() initialStateControls: { [x: string]: InitialState } = {} as any;
  @Input() initialStateFiltro?: { [x: string]: InitialState };
  @Input() onlyCreation?: boolean;

  @Input() defaultFilterOptions?: ValuableOption[];
  @Output() selectionOfAnObject: EventEmitter<any> = new EventEmitter();
  @Output() removeOfAnObject: EventEmitter<any> = new EventEmitter();
  @Output() submition: EventEmitter<any> = new EventEmitter();
  
  @Output() inlineChanges: EventEmitter<any> = new EventEmitter();
  @Output() removedInline: EventEmitter<any> = new EventEmitter();

  @ViewChildren("inputs") inputs!: QueryList<InputComponent>;
  @ViewChildren("file") fileInputs!: QueryList<FileInput>;
  @ViewChildren("filter") filterInputs!: QueryList<FilterComponent>;
  @ViewChildren("inLine") inlineInputs!: QueryList<InlineFormComponent>;

  @Input() disabledCloseFilter!: boolean;

  constructor(
    @Inject(MODULE_CONFIG) private config: CONFIG,
    private rootService: RootService,
    private router: Router,
    private alertService: AlertsService,
    private cdr: ChangeDetectorRef,
    private location:Location
  ) {}

  ngOnInit(): void {
    this.reRoute = this.reRoute || this.config.production;
    Object.entries(this.initialStateControls as any).forEach(
      ([key, { value, disabled, validators }]: any) => {
        this.form.addControl(
          key,
          new FormControl(
            { value: this.forEdit ? this.forEdit[key] : value, disabled },
            validators
          )
        );
      }
    );
    if (this.forEdit) this.form.controls["id"].setValue(this.forEdit.id);
    if (!this.routeForReroute)
      this.useProjectRoutes = `/${
        (this.prefix ? this.prefix + "/" : "") + this.section
      }/listar`;
    else this.useProjectRoutes = this.routeForReroute;
  }

  setValue(controlValue: ValuableOption, type?: string) {
    const [control, value] = Object.entries(controlValue)[0];
    this.form.controls[control.toString()]?.patchValue(value);
    if (type === "selection") {
      // this.form.addControl()
      this.selectionOfAnObject.emit(controlValue);
    }
    if (type === "file") {
      // this.form.addControl()
      this.cdr.detectChanges();
    }
  }

  back(){
    this.location.back();
  }

  addFocusInput(campo: string) {
    const input = this.inputs.find((input) => input.inpTemplate?.name === campo);
    input?.inputTemplate?.nativeElement.focus();
    input?.inputTemplate?.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  submit() {
    if (!this.production) console.log(this.form.value);
    const forLookInputs = this.forLookErrors?.map((camp) =>
      this.inputs.find((input) => input.inpTemplate?.name === camp)
    );
    if (
      this.form.valid &&
      !(
        this.forLookErrors &&
        forLookInputs?.some((input) => input?.control.hasError("incorrect"))
      )
    ) {
      if (this.onlyEmittValue) {
        this.submition.emit(this.form.value);
        return;
      }
      const cleanedForm: any = {};
      Object.entries(this.form.value).forEach(([key, value]) => {
        if (this.FileRoute && this.FileRoute[key]) return;
        else if (this.initialStateControls[key]) cleanedForm[key] = value;
      });
      if (this.forEdit && !this.onlyCreation) {
        this.rootService
          .update(
            this.APIroute ? this.APIroute! : this.section,
            this.form.value,
            this.form.value.id
          )
          .subscribe((res: any) => {
            if (this.reRoute)
              this.router.navigate([`${this.useProjectRoutes}`]);
            console.log(res);
            if (!!this.FileRoute) {
              Object.entries(this.FileRoute).forEach(([control, value]) => {
                if (!this.form.value[control]?.fileData) return;
                this.rootService
                  .createUpdateSetFile(
                    this.APIroute ? this.APIroute : this.section,
                    value,
                    this.form.value[control].fileData,
                    res.id
                  )
                  .subscribe((res) => {
                    console.log(res);
                  });
              });
            }
          });
      } else {
        this.rootService
          .create(
            this.APIroute ? this.APIroute! : this.section,
            this.form.value
          )
          .subscribe((res: any) => {
            if (this.reRoute)
              this.router.navigate([`${this.useProjectRoutes}`]);
            console.log(res);
            if (!!this.FileRoute) {
              Object.entries(this.FileRoute).forEach(([control, value]) => {
                if (!this.form.value[control]?.fileData) return;
                this.rootService
                  .createUpdateSetFile(
                    this.APIroute ? this.APIroute : this.section,
                    value,
                    this.form.value[control].fileData,
                    res.id
                  )
                  .subscribe((res) => {
                    console.log(res);
                  });
              });
            }
          });
      }
    } else {
      let labelInvalids = [
        ...this.inputs.toArray(),
        ...this.filterInputs.toArray(),
        ...this.fileInputs.toArray(),
      ]
        .filter((input) => input.control.invalid)
        .map((input, index) => {
          if (index === 0) {
            this.addFocusInput(input.inpTemplate!.name);
          }
          input.invalid = true;
          input.control.markAsTouched();
          return input.inpTemplate?.label;
        });
      Object.entries(this.initialStateControls).forEach(([control,state])=>{
        if(this.form.controls[control]?.invalid && state.label){
          labelInvalids.push(state.label);
        }
      })
      this.alertService.addAlert(
        "warning",
        "Campos Erróneos!",
        `Por favor, completar/revisar los campos: ${labelInvalids.join(", ")}`
      );
    }
  }
  setValidation(control: string, validators: Validators, type?: InputTypes) {
    this.form.controls[control].setValidators(validators as ValidatorFn);
    this.form.controls[control].updateValueAndValidity({ onlySelf: true });
    let inputForChange: FormControl = this.getInput(control, type)!.control;
    inputForChange.setValidators(validators as ValidatorFn);
    inputForChange.updateValueAndValidity({ onlySelf: true });
  }
  changeValue(control: string, value: any, type?: InputTypes) {
    // this.form.controls[control].setValue(value)
    this.getInput(control, type)?.control.patchValue(value);
  }
  deleteFile(fileName: string, control: string) {
    this.rootService
      .deleteFile(
        this.APIroute ? this.section : this.section,
        this.form.value.id,
        this.FileRoute![`${control}_deletion`],
        fileName
      )
      .subscribe((res) =>
        this.fileInputs.toArray().some((input: FileInput) => {
          if (input.inpTemplate?.name === control) {
            input.downloadFiles = input.downloadFiles.filter(
              (file) => file.name != fileName
            );
            return true;
          }
          return false;
        })
      );
  }
  getValueObservable(name: string, type?: InputTypes):Observable<any> | undefined{
    return this.getInput(name,type)?.control.valueChanges
  }
  getInput<T>(
    name: string,
    type?: InputTypes
  ): InputComponent | FilterComponent | FileInput | undefined {
    if (type === this.fileType)
      return this.fileInputs.find((input) => input.inpTemplate?.name === name);
     else if (type === this.filterType)
      return this.filterInputs.find((input) => input.inpTemplate?.name === name);
    else return this.inputs.find((input) => input.inpTemplate?.name === name);
  }
}
