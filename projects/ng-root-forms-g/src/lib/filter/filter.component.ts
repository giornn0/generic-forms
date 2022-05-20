import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
} from "@angular/forms";
import { environment } from "../../../environments/environment";
import { AlertsService } from "../../services/alerts/alerts.service";
import { PacienteService } from "../../services/http/pacientes/pacientes.service";
import { ApiResponse, RootService } from "../../services/http/root.service";
import {
  EquivalentInput,
  FrontMultiFiles,
  InputFiltro,
  InputTemplate,
} from "../../shared/models/basic/template.form.model";
import {
  ValuableOption,
  InitialState,
} from "../root-form/inputs/inputs.component";

@Component({
  selector: "filter-component",
  templateUrl: "filter.component.html",
})
export class FilterComponent implements OnInit {
  @ViewChildren("filterOptions") filterOpt?: QueryList<ElementRef>;
  @ViewChildren("filterInputs") filterInputs?: QueryList<ElementRef>;

  label?: string;
  @Input() disabledCloseFilter?: boolean;
  @Input() initialState: InitialState = {} as InitialState;
  @Input() inpTemplate?: InputTemplate;

  @Input() value?: any;
  @Input() selections: any[] = new Array<ValuableOption>();
  @Input() optionsForSelection?: ValuableOption[];
  @Input() idComprobante?: number;

  refreshingFilter: boolean = false;
  wantsAutoFocus = true;

  filterForm: FormGroup = new FormGroup({});

  @Output() selectionOfAnObject: EventEmitter<any> = new EventEmitter();
  @Output() removeOfAnObject: EventEmitter<any> = new EventEmitter();
  constructor(
    private cdr: ChangeDetectorRef,
    private pacienteService: PacienteService,
    private alertService: AlertsService,
    private rootService: RootService
  ) {}

  control: FormControl = new FormControl();
  quantity?: FormControl;
  invalid?: boolean;

  ngOnInit() {
    this.wantsAutoFocus = this.inpTemplate?.autoFocus == false ? false : true;
    this.label = this.inpTemplate?.label;
    this.control.valueChanges.subscribe((value) => {
      this.selections = [...value];
      // if (!this.forSelection && !this.forQuantity)
      this.selectionOfAnObject.emit({ [this.inpTemplate!.name]: value });
    });
    this.control.setValue([]);
    if (this.initialState?.disabled) this.control.disable();
    if (this.initialState?.validators)
      this.control.setValidators(this.initialState.validators as ValidatorFn);
    this.inpTemplate?.filters?.forEach((filter) =>
      this.filterForm.addControl(filter.name, new FormControl())
    );
    if (this.value)
      this.value.forEach((selection: any) => this.pushToFilter(selection));
    if (this.inpTemplate?.forQuantity)
      this.quantity = new FormControl({ value: 0, disabled: true });
  }

  filterFocus = 0;
  focusFilterOption = false;
  afterDeleteFocus = false;

  setFilterOptions(options: any[]) {
    this.filterFocus = 1;
    this.refreshingFilter = false;
    this.focusFilterOption = true;
    this.optionsForSelection = options;
  }
  cleanFilterOptions() {
    this.optionsForSelection = [];
  }

  actionsFilter(event: KeyboardEvent, index: number) {
    if (event.key == "ArrowDown") {
      if (this.filterOpt?.toArray()[index + 1])
        this.filterOpt.toArray()[index + 1].nativeElement.focus();
      else this.filterOpt?.toArray()[0].nativeElement.focus();
    } else if (event.key == "ArrowUp") {
      if (this.filterOpt?.toArray()[index - 1])
        this.filterOpt.toArray()[index - 1].nativeElement.focus();
      else
        this.filterOpt
          ?.toArray()
          [this.filterOpt.toArray().length - 1].nativeElement.focus();
    } else if (event.key == "Enter") {
      this.filterOpt?.toArray()[index].nativeElement.click();
    }
    // this.changing=false
  }
  pushToFilter(option: any) {
    const { classAnimationIn, classAnimationOut, ...trueOption } = option;
    if (this.inpTemplate?.forSelection) {
      Object.entries(this.inpTemplate?.forSelection).forEach(
        ([key, valueAccces]) => {
          this.selectionOfAnObject.emit({ [key]: trueOption[valueAccces] });
        }
      );
    }
    this.control.setValue([...this.control.value, trueOption]);
    this.optionsForSelection = [];
    this.cleanFilterForm();
    if (this.wantsAutoFocus) {
      this.filterInputs?.first.nativeElement.focus();
    }
  }

  cleanFilterForm() {
    this.inpTemplate?.filters?.forEach((filter) =>
      this.filterForm.controls[filter.name].setValue(null)
    );
  }

  removeFromFilter(option: any) {
    setTimeout(() => {
      if (this.inpTemplate?.forSelection) {
        Object.entries(this.inpTemplate?.forSelection).forEach(
          ([key, valueAccces]) => {
            this.selectionOfAnObject.emit({ [key]: null });
          }
        );
        this.afterDeleteFocus = true;
      }
      this.control.patchValue(
        this.control.value.filter((objList: any) => objList.id != option.id)
      );
      this.removeOfAnObject.emit(true);
    }, 1200);
  }

  isSelectedForTheFilter(option: any): boolean {
    const { classAnimationIn, classAnimationOut, ...trueOption } = option;
    return this.control.value.includes(trueOption);
  }
  ngAfterViewChecked(): void {
    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.
    if (this.focusFilterOption && this.filterOpt?.toArray().length) {
      this.focusFilterOption = false;
      if (this.disabledCloseFilter) this.filterOpt.first.nativeElement.click();
      else this.filterOpt.first.nativeElement.focus();
      this.cdr.detectChanges();
    }
    if (this.afterDeleteFocus) {
      this.afterDeleteFocus = false;
      this.filterInputs?.first.nativeElement.focus();
    }
  }
  apiRoute: string = environment.API_URL;
  opennedRepository: number[] = [];
  maxFileSize?: number;

  removeFileFromDrive(fileName: string, pacienteId: number, index: number) {
    this.rootService
      .deleteDocumental(pacienteId, fileName, this.idComprobante!)
      .subscribe((res: ApiResponse<any>) => {
        if (res.success) {
          this.selections[index].repository = this.selections[
              index
            ].repository.filter((file: any) =>{
              return file.fileName != fileName;
            });
        }
      });
  }

  toggleRow(rowIndex: number) {
    if (this.openRepository(rowIndex)) {
      this.opennedRepository.splice(
        this.opennedRepository.indexOf(rowIndex),
        1
      );
    } else {
      this.opennedRepository.push(rowIndex);
    }
  }

  openRepository(rowIndex: number): boolean {
    return this.opennedRepository.includes(rowIndex);
  }

  uploadItemMultiple(pacienteId: number, event: any, index: number) {
    const formData = new FormData();
    const list = event.target.files as FileList;
    const files: FrontMultiFiles[] = [];
    for (let ind = 0; ind < list.length; ind++) {
      const uploadedFile = list[ind];
      if (uploadedFile.size > 2000000) {
        this.alertService.addAlert(
          "warning",
          `Archivo ${uploadedFile.name} muy grande! (max: ${this.maxFileSize})`
        );
      } else {
        const fileReader = new FileReader();
        const fileName = uploadedFile.name;
        fileReader.onload = (e) => {
          files.push({
            fileName,
            fileUrl: fileReader.result as string,
            upload: true,
          });
        };
        fileReader.readAsDataURL(uploadedFile);
        formData.set(fileName, uploadedFile);
      }
    }
    this.pacienteService
      .uploadDocumental(pacienteId, formData, this.idComprobante!)
      .subscribe((res) => {
        if (res.success) {
          if (!this.value[index].repository){
            this.value[index].repository = [];
          }
          this.value[index].repository.push(...files);
        }
      });
  }
}
