import { IUnknownFields } from './unknown-fields.interface';

export interface IUserUnknownFields {
    id: string;
    email: string;
    phone: string;
    ip_address: string;
    _unknownFields: IUnknownFields;
}
