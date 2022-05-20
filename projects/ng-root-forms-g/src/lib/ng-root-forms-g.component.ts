import { Component, Inject, OnInit } from '@angular/core';
import { CONFIG, MODULE_CONFIG } from './ng-root-forms-g.module';

@Component({
  selector: 'lib-ng-root-forms-g',
  template: `
    <p>
      ng-root-forms-g works!
    </p>
  `,
  styles: [
  ]
})
export class NgRootFormsGComponent implements OnInit {

  constructor(@Inject(MODULE_CONFIG) private config: CONFIG) { }

  ngOnInit(): void {
    console.log(this.config.apiUrl)
  }

}
