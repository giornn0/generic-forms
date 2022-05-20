import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import {  Observable,timer,throwError, } from "rxjs";
import {  map,  retryWhen} from 'rxjs/operators';
import { mergeMap, finalize } from 'rxjs/operators';
import { CONFIG, MODULE_CONFIG } from "../ng-root-forms-g.module";

export const GenericDelay = ({
}: {
} = {}) => (attempts: Observable<any>) => {
  return attempts.pipe(
    mergeMap((error:any, i) => {
        const retryAttempt = i + 1;
        if ((retryAttempt >1 ||error.status !=419)){
          return throwError(()=>new Error(error));
        }
        return timer(2500);
      }),
      finalize(() => {}),
  );
};

interface Pagination{
  actualPage: number
  links:{before: [], actual: 1, after: [] }
  nextPage: number
  prevPage: number
  resultPerPage: number
  totalPages: number
  totalResults:number
}

export interface ApiResponse<T>{
  data:T,
  success?:boolean,
  pagination?:Pagination,
  user:{id:number,role:string},
}


@Injectable()
export class RootService {
  constructor(private http: HttpClient,@Inject(MODULE_CONFIG) private config: CONFIG) {}
 
  deleteFile(section:string,id: number,route:string,fileName: string): Observable<ApiResponse<any>> {
    const body = {
        fileName
   };
   return this.http.request<ApiResponse<any>>('DELETE',`${this.config.apiUrl}/${section}/${id}/${route}`,
     {
       body
     }
   ).pipe(
      map((resp)=>(resp.data)),
      retryWhen( GenericDelay({})),
      // catchError(error=> of(error))
      );;;
  }

  create<T>(section:string,value: T): Observable<T> {
    const post  = this.purgeValues(value);
    return this.http.post<ApiResponse<T>>(`${this.config.apiUrl}/${section}`, post).pipe(
      ).pipe(
        map((resp)=>(resp.data)),
        retryWhen( GenericDelay({})),
        // catchError(error=> of(error))
        );;;
  }
  update<T>(section:string,value: T, id: number, extra?: string): Observable<T> {
    const updated = this.purgeValues(value);
    return this.http.put<ApiResponse<T>>(`${this.config.apiUrl}/${section}/${id}${extra?'/'+extra:''}`, updated).pipe(
      ).pipe(
        map((resp)=>(resp.data)),
        retryWhen( GenericDelay({})),
        // catchError(error=> of(error))
        );;;;
  }
  createUpdateSetFile(section:string,route:string,file:any,id?:number): Observable<unknown>{
    return this.http.post(`${this.config.apiUrl}/${section}${id?'/'+id.toString():''}/${route}`,file)
  }

  private purgeValues(values: {[x: string]: any}){
    Object.entries(values).forEach(([key,value])=>{
      if(value===null || value ===undefined) delete values[key];
    })
    return values;
  }
}
