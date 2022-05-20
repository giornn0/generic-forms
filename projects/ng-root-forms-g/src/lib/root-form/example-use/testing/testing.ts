import { Component, OnInit, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
  template:`
    <generic-child-component></child-component>
  `
})
export class ParentComponent implements OnInit{
  @ViewChild(ChildGenericComponent)child: ChildGenericComponent
  delaySubject: Subject<string> = new Subject();

  contructor (private apiService: ApiService){}

  ngOnInit(){
    this.delaySubject.pipe(
      debounceTime(2500),
    ).subscribe(query=>{
      this.apiService.get(query).subscribe(fetchedData=>{
        this.child.fetchedOptions = fetchedData
        //Here I want to put a foucs in the first Object
        //but i need to make a setTimeout to get the rendered option in the child component
        setTimeout(() => {
          this.child.optionsInputs.first.nativeElement.focus() //If this its outside this setTimeout the child.optionsInputs = undefined
        })
        

      })
    })
  }

  ngAfterViewInit(): void {
    this.child.form.controls['filter'].subscribe(query=>this.delaySubject.next(query))
  }

}