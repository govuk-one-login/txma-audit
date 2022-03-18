import { IRequiredFieldError } from './required-field-error.interface';

export interface IValidationResponse {
    isValid: boolean;
    message: string;
    error?: IRequiredFieldError;
}
