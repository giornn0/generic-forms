import { ViewChild, AfterViewInit } from "@angular/core";
import { OnDestroy } from "@angular/core";
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { FormControl, ValidatorFn, Validators } from "@angular/forms";
import { from, Subscription } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { getEditor } from "../../functions/editor";
import { MaskedDate } from "../../functions/mask.date";
import {
  InputTemplate,
  InputTypes,
} from "../../models/basic/template.form.model";
import { RootService } from "../../services/root.service";
import { FileControlValue } from "../fileInput/file-input.component";

export interface ValuableOption {
  [x: string]:
    | string
    | number
    | Date
    | boolean
    | ValuableOption
    | null
    | FileControlValue
    | Array<ValuableOption>;
}

export interface InitialState {
  value: string | number | Date | boolean | ValuableOption | null | Array<any>;
  disabled?: boolean;
  validators?: Validators;
  label?: string;
}

@Component({
  selector: "input-component",
  templateUrl: "inputs.component.html",
  styleUrls: ["../styles.scss", "input.component.scss"],
  providers:[RootService]
})
export class InputComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("inputRoot") inputTemplate?: ElementRef;
  @ViewChild("labelRoot") labelTemplate?: ElementRef;
  @ViewChild("editor") editor?: ElementRef<HTMLElement>;

  @Input() inpTemplate?: InputTemplate;
  @Input() warned?: boolean = false;

  required: BehaviorSubject<boolean> = new BehaviorSubject(true as boolean);
  label: string = "";
  @Input() selectOptions?: Array<ValuableOption> | null = null;

  @Input() form: ValuableOption = {};
  @Input() initialState: InitialState = {} as InitialState;
  @Input() value?: any;

  @Output() valueEmitted: EventEmitter<ValuableOption> = new EventEmitter();

  control: FormControl = new FormControl();
  invalid?: boolean;

  filterOptions?: any[];
  filterForTags: FormControl = new FormControl();

  valueSubscription?: Subscription;

  typeCheckbox = InputTypes.Checkboxes;
  typeDate = InputTypes.Date;
  typeCuit = InputTypes.Cuit;
  typeZerofill = InputTypes.Zerofill;
  typeSelect = InputTypes.Select;
  typeTextarea = InputTypes.Textarea;
  typeEditor = InputTypes.Editor;
  typeTags = InputTypes.Tags;
  typeURL = InputTypes.URL;

  ngOnInit() {
    this.label = this.inpTemplate!.label;
    this.control.setValue(
      this.value != undefined || this.value != null
        ? this.value
        : this.initialState.value
    );
    if (this.inpTemplate?.required) this.inpTemplate.requiredState = true;
    if (this.initialState.disabled) this.control.disable();
    if (this.initialState.validators)
      this.control.setValidators(this.initialState.validators as ValidatorFn);
    this.valueSubscription = this.subToChanges();
    if (!this.inpTemplate?.requiredState) this.required.next(false);
    if (this.inpTemplate?.type === InputTypes.Tags) {
      this.filterForTags.valueChanges.subscribe((forSearch: string) => {
        this.filterOptions = this.selectOptions?.filter(
          (item) =>
            item[this.inpTemplate!.optionsDescriptionAccess!]
              ?.toString()
              .toLowerCase()
              .includes(forSearch.toLowerCase()) &&
            !this.control.value.includes(item)
        );
      });
    }
    if (
      (this.inpTemplate?.type === InputTypes.Checkboxes ||
        this.inpTemplate?.type === InputTypes.Tags) &&
      !this.value
    )
      this.control.setValue([]);
  }
  subToChanges(): Subscription {
    return this.control.valueChanges.subscribe((value) => {
      this.settingValue(value);
      if (this.control.valid) this.invalid = false;
    });
  }
  ngOnDestroy(): void {
    this.valueSubscription?.unsubscribe();
  }
  isTouched(): boolean {
    return !!this.control.touched;
  }
  isInvalid(): boolean {
    return !!this.control.invalid;
  }
  hasValue() {
    if (!this.control.value) return false;
    if (this.selectOptions && this.inpTemplate!.optionsDescriptionAccess) {
      let arr: any[] = this.selectOptions.map(
        (option) => option[this.inpTemplate!.optionsDescriptionAccess!]
      );
      return !!(this.control.value != "" || arr.includes(this.control.value));
    } else return !!(this.control.value != "" && this.control.value != 0);
  }
  updatingCheckboxs(value: any) {
    if (value == undefined || value == null) return;
    const array = this.control.value;
    if (!array.includes(value)) {
      array.push(value);
      this.control.setValue(array);
    } else {
      this.control.setValue(
        array.filter((selections: any) => selections != value)
      );
    }
  }
  cuitMask(event: any, dni?: string) {
    var v = event.target.value;
    if (v.match(/^\d{2}$/) !== null) {
      if (dni) {
        event.target.value = v + "-" + dni + "-";
        return;
      }
      event.target.value += "-";
    } else if (v.match(/^\d{2}\-\d{8}$/) !== null) {
      event.target.value = v + "-";
    }
  }
  urlMask(event: any, dni?: string) {
    var v = event.target.value;
    event.target.value = v.replace(" ", "-");
    return;
  }
  zerofillMask(event: any, length: number) {
    var z = event.target.value;
    event.target.value = z.replace(/[^\d]/, "");
    const withUse = event.target.value;
    if (withUse.length > length) {
      this.control.patchValue(withUse.substring(1));
    } else {
      this.control.patchValue("0".repeat(length - withUse.length) + withUse);
    }
  }
  dateMask = MaskedDate;
  ngAfterViewInit(): void {
    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.
    if (this.inpTemplate?.type === InputTypes.Editor) {
      const editor = getEditor(this.editor!);
      editor.session.setValue(this.value || "");
      editor.session.setMode("ace/mode/html");
      editor.on("change", () => {
        this.control.setValue(editor.getValue());
      });
    }
  }

  settingValue(value: any) {
    this.valueEmitted.emit({
      [this.inpTemplate!.name]:
        this.inpTemplate?.typeinput === "number" && !this.inpTemplate.zerofill
          ? Number(value)
          : value,
    });
  }
  selected: any;

  // getOptions(){
  //   if(this.selected){
  //     return [this.selected,...this.selectOptions!]
  //   }return this.selectOptions
  // }

  handlerKeyTags(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.control.value.push({
        [this.inpTemplate!.optionsDescriptionAccess!]: this.filterForTags.value,
      });
      this.filterForTags.setValue(null);
    }
    if (event.key === "Backspace" && !this.filterForTags.value) {
      this.control.value.pop();
    }
  }
  pushToSelection(value: any) {
    this.control.value.push(value);
    this.control.setValue(this.control.value);
    this.filterOptions = this.filterOptions?.filter(
      (option) => option != value
    );
  }
  removeValue(value: any) {
    this.control.setValue(
      this.control.value.filter((item: any) => item != value)
    );
    this.filterForTags.setValue(this.filterForTags.value);
  }
  cleanFilterOptions() {
    if (this.filterOptions) this.filterOptions.length = 0;
  }
}
