import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgRootFormsGComponent } from './ng-root-forms-g.component';

describe('NgRootFormsGComponent', () => {
  let component: NgRootFormsGComponent;
  let fixture: ComponentFixture<NgRootFormsGComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgRootFormsGComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgRootFormsGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
