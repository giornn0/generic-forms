import { ElementRef } from "@angular/core";
import * as ace from "ace-builds"
ace.config.set("fontSize", "14px");
ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');
ace.config.set('theme','ace/theme/twilight')

export const getEditor = (element: ElementRef): ace.Ace.Editor=>{
  return ace.edit(element.nativeElement)
}