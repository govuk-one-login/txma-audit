import { IUnknownFieldDetails } from './unknown-field-details.interface';
import { ILogDetails } from './log-details.interface';

export interface IUnknownFieldsError extends ILogDetails {
    unknownFields: Array<IUnknownFieldDetails>;
}
