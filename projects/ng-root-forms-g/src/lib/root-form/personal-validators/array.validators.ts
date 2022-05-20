import { AbstractControl, ValidatorFn } from '@angular/forms';

export class ArrayValidators {

    static minLength(min: number): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            if (c.value  && c.value.length >=min && c.value.isArray) {
                return { minLength: true };
            }
            return null;
        };
    }
    static maxLength(max: number): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            if (c.value  && c.value.length <=max && c.value.isArray) {
                return { minLength: true };
            }
            return null;
        };
    }
    static range(min:number,max: number): ValidatorFn {
      return (c: AbstractControl): { [key: string]: boolean } | null => {
            if (c.value.length <=max && c.value.length >=min && c.value.isArray) {
                return { minLength: true };
            }
            return null;
        };
    }
}