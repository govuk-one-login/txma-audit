import { IUnknownFieldDetails } from './unknown-field-details.interface';
import { IEventSourceDetails } from './event-source-details.interface';

export interface IUnknownFieldsWarning extends IEventSourceDetails {
    unknownFields: Array<IUnknownFieldDetails>;
    eventName: string;
    eventId: string;
    timeStamp: string | undefined;
}
