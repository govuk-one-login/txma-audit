import { IValidationResponse } from './validation-response.interface';

export interface IValidationException {
    validationResponses: IValidationResponse[];
}
