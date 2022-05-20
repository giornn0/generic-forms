import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlertsService } from '../../../services/alerts/alerts.service';
import { InitialState } from '../inputs/inputs.component';
import {environment as env }from "../../../../environments/environment"
import { Action, ModalService } from '../../../services/modals/modals.service';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { defaultImageFile } from '../../../constants/files';
import { InputTemplate } from '../../../shared/models/basic/template.form.model';

export interface FileControlValue{
  fileName : string | string[]
  fileData: FormData,
  fileType: string
}
export interface FrontFileInput{
  name: string;
  application?: string;
  value: string;
  url?: boolean;
}
@Component({
  selector:'file-input',
  templateUrl:'file-input.component.html',
  styleUrls: ["../../../app.component.css"],

})
export class FileInput implements OnInit {
  @ViewChild('labelRoot')labelTemplate?: ElementRef;
  @Input()initialState:InitialState = {} as  InitialState;
  @Input()inpTemplate:InputTemplate = {} as  InputTemplate;
  @Input()validator?:Validators
  
  @Input()warned?:boolean =false
  @Input()maxFileSize?:number
  @Input()value?: FrontFileInput | Array<{name:string;}>

  @Output()fileSelected: EventEmitter<{[x:string]:FileControlValue}>=  new EventEmitter()
  @Output()fileDeleted: EventEmitter<string>=  new EventEmitter()

  constructor(private alertService: AlertsService, private sanitizer: DomSanitizer, private modalService: ModalService){}

  control:FormControl = new FormControl()
  invalid?:boolean
  defaultImgFile = defaultImageFile;

  formData:FormData=  new FormData()
  fileNames: string[] =[''];
  downloadFiles: any[]= [];
  fileName?: string;
  fileUrl?:string;

  fileForEditURL: string= '';
  downloadName?: string;


  ngOnInit(){
    this.control.setValue(this.initialState.value)
    if(this.initialState.disabled)this.control.disable()
    if(this.initialState.validators)this.control.setValidators(this.initialState.validators as ValidatorFn)
    if(this.value && !this.inpTemplate.multiple && !(this.value instanceof Array)){
      if(this.value.url){
        this.fileName = this.value.name;
        this.fileForEditURL = this.value.value;
        this.fileUrl = this.value.value;
        this.downloadName = this.value.name;
      }else{
        const blob = this.dataURItoBlob(this.value.value,this.value.application);
        this.fileForEditURL = this.getSanitizedURL(blob) as string;
        this.setFile(blob,this.value.name,this.value.application)
      }
    }else if (this.value && this.value instanceof Array){
      this.pushFiles(this.value)
    }
  }



  uploadItemMultiple(event: any,index: number,filename?: string){
    const list = event.target.files as FileList;
    for (let ind = 0; ind < list.length; ind++) {
      const uploadedFile = list[ind];
      
      if(uploadedFile.size>2000000){
        this.alertService.addAlert('warning',`Archivo ${uploadedFile.name} muy grande! (max: ${this.maxFileSize})`)
      }
      else{
        this.fileNames[this.inpTemplate.multiple && index===0?this.fileNames.length:index]=uploadedFile.name
        if(!this.inpTemplate.multiple){
          this.formData.set(this.inpTemplate.name,uploadedFile)
        } 
        else{
          if(!!filename)this.formData.delete(filename)
          this.formData?.set(uploadedFile.name,uploadedFile,uploadedFile.name)
        }
        const value = {
          fileData: this.formData,
          fileName : this.inpTemplate.multiple?this.fileNames:uploadedFile.name,
          fileType: uploadedFile.type
        }
        this.fileSelected.emit({[this.inpTemplate.name]:value})
        this.invalid=false
      }
    }
  }
  removeListedFile(index: number, name: string){
    this.formData.delete(name)
    const value = {
      fileData: this.formData,
      fileName : this.inpTemplate.multiple?this.fileNames:name,
      fileType: ''
    }
    this.fileNames.splice(index,1)
    this.fileSelected.emit({[this.inpTemplate.name]:value})
  }
  uploadItem(event : any){
    if(event.target.files[0].size>2000000){
      this.alertService.addAlert('warning',`Archivo muy grande! (max: ${this.maxFileSize})`)
    }
    else{
      if (this.inpTemplate?.previewImg){
        const fileReader = new FileReader()
        fileReader.onloadend = (evnt)=> {
          this.fileUrl = fileReader.result as string;
          this.fileForEditURL = fileReader.result as string;

          const uploadedFile = event.target.files[0]
          this.formData.set(this.inpTemplate?.name,uploadedFile)
          this.fileName = uploadedFile.name;
          const value = {
            fileData: this.formData,
            fileName : uploadedFile.name,
            fileType: uploadedFile.type
          }
          this.fileSelected.emit({[this.inpTemplate?.name]:value})
          this.invalid=false
        }
        fileReader.readAsDataURL(event.target.files[0])
      }else{
        const uploadedFile = event.target.files[0]
        this.formData.set(this.inpTemplate?.name,uploadedFile)
        this.fileName = uploadedFile.name;
        const value = {
          fileData: this.formData,
          fileName : uploadedFile.name,
          fileType: uploadedFile.type
        }
        this.fileSelected.emit({[this.inpTemplate?.name]:value})
        this.invalid=false
      }
    }
  }
  isInvalid(): boolean {
    return !! this.control.invalid;
  }

  cleanFile(){
    this.control.patchValue(null)
  }

  setFile(blob: Blob, name: string, application?:string){
    this.formData.set(this.inpTemplate?.name,blob)
    this.fileName = name
    this.downloadName = name
    const value = {
        fileData: this.formData,
        fileName : name ,
        fileType: application || 'application/pdf'
      }
      this.fileSelected.emit({[this.inpTemplate?.name]:value})
  }
  pushFiles(files: any[]){
    files?.forEach(file=>{
      // this.fileNames.push(file.fileName);
      const ext = file.fileName.split('.').slice(-1);
      this.downloadFiles.push({
        name: file.fileName,
        url:`${env.API_URL}${file.fileUrl}`,
        icon: this.getIcon(ext)
      });
    })
  }
  getFileSource(index:number){

  }
  removeFileFromDrive(name: string){
    this.fileDeleted.emit(name)
  }

  getIcon(ext: string){
    return ext.includes('png')?'fa-image':
    ext.includes('pdf')?'fa-file-pdf':
    ext.includes('mp4')?'fa-video':'fa-file-archive'
  }
  getSanitizedURL(data:Blob| MediaSource){
    const source = window.URL.createObjectURL(data)
    return this.sanitizer.bypassSecurityTrustResourceUrl(source)
  }
  
  dataURItoBlob(dataURI: string,application?:string) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    // const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: application || 'application/pdf' });    
    return blob;
 }

 imageAction(){
   if(this.hasDefaultImage()){
    this.labelTemplate?.nativeElement.click();
   }else this.openModalPreview()
 }

 openModalPreview(){
  const action: Action = {
    type: "image",
    info: "uploaded"
  };
  this.modalService.setModal("image", `Viendo Preview `, this.fileUrl || this.fileForEditURL, action);

 }

 hasDefaultImage(){
  return (this.inpTemplate?.previewImg && (this.fileForEditURL?.includes(this.defaultImgFile) || this.fileUrl?.includes(this.defaultImgFile))) 
 }
}