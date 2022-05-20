import { Component, OnInit, ViewChild, ViewChildren } from "@angular/core";
import { Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { RootFormComponent } from "../root-form.component";

@Component({
  templateUrl: "root.form.template.html",
  styleUrls: ["../../../app.component.css"]
})
export class root implements OnInit {
  constructor(private activatedRoute: ActivatedRoute) {}

  @ViewChild(RootFormComponent)form: RootFormComponent 

  title = ''

  campsTemplate =  [
    [
        {name:'nombre',class:'form-group col-sm-3',type:'select',options:[{value:1,description:'Activo'},{value:0,description:'Inactivo'}],label:'Nombre',required:true,},
        {name:'apellido',class:'form-group col-sm-3',type:'date',options:[],label:'Nombre',required:false,typeinput:'text'},
        {name:'username',class:'form-group col-sm-4',type:'input',options:[],label:'Nombre',required:true,typeinput:'text'}
    ],
    [
      {name:'pruebita',class:'form-group col-sm-3',type:'select',options:[{value:1,description:'Activo'},{value:0,description:'Inactivo'}],label:'Nombre',required:true,},
        {name:'segunda',class:'form-group col-sm-3',type:'date',options:[],label:'Segundo item segunda fila',required:true,typeinput:'text'},
        {name:'fila',class:'form-group col-sm-4',type:'input',options:[],label:'Nombre',required:false,typeinput:'text'}
    ],
    [],
]

campsValidation = {
  nombre:[{value:null,disabled:true},[Validators.required,Validators.email]],
  apellido:[{value:null,disabled:true},[Validators.required,Validators.email]],
  username:[{value:null,disabled:true},[Validators.required,Validators.email]],
  pruebita:[{value:null,disabled:true},[Validators.required,Validators.email]],
  segunda:[{value:null,disabled:true},[Validators.required,Validators.email]],
  fila:[{value:null,disabled:false},[Validators.required,Validators.email]],
}

campsForm = []

  ngOnInit(){
    this.campsTemplate.forEach(row=> row.forEach(camp=> this.campsForm.push(camp.name)))
    this.activatedRoute.data.subscribe(data=>{
      this.title = data.title
    })
  }

  ngAfterViewInit(): void {
    this.form.form.controls['fila'].valueChanges.subscribe(values=>{
      if(this.form.form.controls['fila'].valid) this.form.form.controls['username'].enable()
      else this.form.form.controls['username'].disable()
    })
    this.form.form.valueChanges.subscribe(form=>{
      console.log(this.form.form.valid)
    })
  }

}
