import { InputTemplate } from "./template.form.model";
import { MainListTemplate } from "./template.list.model";

export interface DataRoute{
    title:string,
    campsValidation?:{},
    campsTemplate?: Array<InputTemplate[]>
    template?:MainListTemplate
}
