import { JSONPath } from 'jsonpath-plus';

export interface IRedactedBillingAuditEvent {
    event_id: string;
    timestamp: number;
    timestamp_formatted: string;
    event_name: string;
    client_id: string;
    component_id: string;
    user?: IRedactedAuditEventUserMessage | undefined;
}

export interface IRedactedAuditEventUserMessage {
    user_id?: string;
    govuk_signin_journey_id?: string;
    transaction_id?: string;
}

function createBaseRedactedAuditEvent(): IRedactedBillingAuditEvent {
    return {
        event_id: '',
        timestamp: 0,
        timestamp_formatted: '',
        event_name: '',
        client_id: '',
        component_id: '',
        user: createBaseRedactedAuditEventUserMessage(),
    };
}

export class RedactedBillingAuditEvent implements IRedactedBillingAuditEvent {
    readonly event_id: string;
    readonly event_name: string;
    readonly timestamp: number;
    readonly timestamp_formatted: string;
    readonly client_id: string;
    readonly component_id:string;
    readonly user?: IRedactedAuditEventUserMessage | undefined;

    constructor(
        event_id: string,
        event_name: string,
        client_id: string,
        component_id: string,
        timestamp: number,
        timestamp_formatted: string,
        user?: unknown | undefined,
    ) {
        this.event_id = event_id;
        this.event_name = event_name;
        this.timestamp = timestamp;
        this.timestamp_formatted = timestamp_formatted;
        this.client_id = client_id;
        this.component_id = component_id;
    }


    // eslint-disable-next-line @typescript-eslint/ban-types
    static billingDataExtractor(snsMessage: Object): IRedactedBillingAuditEvent {
        const redactedAuditData: IRedactedBillingAuditEvent = createBaseRedactedAuditEvent();

        redactedAuditData.event_id = JSONPath({
            path: '$.event_id',
            json: snsMessage,
        })[0];

        redactedAuditData.event_name = JSONPath({
            path: '$.event_name',
            json: snsMessage,
        })[0];

        const transaction_id = JSONPath({
            path: '$.user.transaction_id',
            json: snsMessage,
        })[0];

        if (transaction_id != undefined) {
            (redactedAuditData.user as IRedactedAuditEventUserMessage).transaction_id = transaction_id;
        }

        redactedAuditData.timestamp = JSONPath({
            path: '$.timestamp',
            json: snsMessage,
        })[0];

        redactedAuditData.timestamp_formatted = JSONPath({
            path: '$.timestamp_formatted',
            json: snsMessage,
        })[0];


        redactedAuditData.client_id = JSONPath({
            path: '$.client_id',
            json: snsMessage,
        })[0];

        redactedAuditData.component_id = JSONPath({
            path: '$.component_id',
            json: snsMessage,
        })[0];


        return redactedAuditData;
    }
}

function createBaseRedactedAuditEventUserMessage(): IRedactedAuditEventUserMessage {
    return {
        user_id: '',
        govuk_signin_journey_id: '',
        transaction_id: '',
    };
}