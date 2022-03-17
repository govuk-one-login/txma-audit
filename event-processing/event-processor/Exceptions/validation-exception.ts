import { IValidationException } from '../models/validation-exception.interface';
import { IValidationResponse } from '../models/validation-response.interface';

export class ValidationException extends Error implements IValidationException {
    constructor(message: string, validationResponses: IValidationResponse[] = []) {
        super(message);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ValidationException.prototype);

        this.validationResponses = validationResponses;
    }

    validationResponses: IValidationResponse[];
}
