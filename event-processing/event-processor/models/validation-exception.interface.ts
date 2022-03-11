import { IValidationResponse } from './validation-response.interface';

export interface IValidationException {
    ValidationResponses: IValidationResponse[];
}
