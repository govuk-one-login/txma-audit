export interface IUserUnknownFields {
    id: string;
    email: string;
    phone: string;
    ip_address: string;
    _unknownFields: Map<string, unknown>;
}

export const IUserUnknownFields = {
    fromAuditEvent(object: any, unknown_fields: Map<string, unknown>): IUserUnknownFields {
        return {
            id: isSet(object.id) ? String(object.id) : '',
            email: isSet(object.email) ? String(object.email) : '',
            phone: isSet(object.phone) ? String(object.phone) : '',
            ip_address: isSet(object.ip_address) ? String(object.ip_address) : '',
            _unknownFields: unknown_fields,
        };
    },
};

function isSet(value: any): boolean {
    return value !== null && value !== undefined;
}