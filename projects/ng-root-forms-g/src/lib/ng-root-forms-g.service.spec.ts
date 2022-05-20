import { TestBed } from '@angular/core/testing';

import { NgRootFormsGService } from './ng-root-forms-g.service';

describe('NgRootFormsGService', () => {
  let service: NgRootFormsGService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgRootFormsGService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
