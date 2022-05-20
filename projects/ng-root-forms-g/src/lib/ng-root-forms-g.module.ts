import { CommonModule } from '@angular/common';
import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgRootFormsGComponent } from './ng-root-forms-g.component';
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { RouterModule } from '@angular/router';
import { InputComponent } from './root-form/inputs/inputs.component';
import { FilterComponent } from './filter/filter.component';
import { FileInput } from './root-form/fileInput/file-input.component';
import { ActionsFilterDirective } from './root-form/directives/actions-filter.directive';
import { RootFormComponent } from './root-form/root-form.component';

export interface CONFIG {
  apiUrl: string;
  production: boolean,
}

export const MODULE_CONFIG = new InjectionToken(
  "This is a configuration object for our dialog component",
);

@NgModule({
  declarations: [
    NgRootFormsGComponent,
    RootFormComponent,
    ActionsFilterDirective,
    InputComponent,
    FilterComponent,
    FileInput,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    BsDatepickerModule,
  ],
  exports: [
    RootFormComponent,
    NgRootFormsGComponent,
    InputComponent,
    FilterComponent,
    FileInput,
  ],
})
export class NgRootFormsGModule {
  static forRoot(config: CONFIG): ModuleWithProviders<NgRootFormsGModule> {
    return {
      ngModule: NgRootFormsGModule,
      providers: [{ provide: MODULE_CONFIG, useValue: config }],
    };
  }
}
