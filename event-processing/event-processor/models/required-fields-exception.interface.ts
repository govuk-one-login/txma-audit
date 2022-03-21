import { IRequiredFieldError } from './required-field-error.interface';

export interface IRequiredFieldsException {
    requireFieldErrors: IRequiredFieldError[];
}
