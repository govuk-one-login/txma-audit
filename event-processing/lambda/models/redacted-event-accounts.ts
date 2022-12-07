import { JSONPath } from 'jsonpath-plus';

export interface IRedactedAuditEvent {
    event_id: string;
    timestamp: number;
    timestamp_formatted: string;
    event_name: string;
    client_id: string;
    user?: IRedactedAuditEventUserMessage | undefined;
}

export interface IRedactedAuditEventUserMessage {
    user_id?: string;
    govuk_signin_journey_id?: string;
}

function createBaseRedactedAuditEvent(): IRedactedAuditEvent {
    return {
        event_id: '',
        timestamp: 0,
        timestamp_formatted: '',
        event_name: '',
        client_id: '',
        user: createBaseRedactedAuditEventUserMessage(),
    };
}

export class RedactedAuditEvent implements IRedactedAuditEvent {
    readonly event_id: string;
    readonly event_name: string;
    readonly client_id: string;
    readonly timestamp: number;
    readonly timestamp_formatted: string;
    readonly user?: IRedactedAuditEventUserMessage | undefined;

    constructor(
        event_id: string,
        event_name: string,
        client_id: string,
        timestamp: number,
        timestamp_formatted: string,
        user?: unknown | undefined,
    ) {
        this.event_id = event_id;
        this.event_name = event_name;
        this.client_id = client_id;
        this.timestamp = timestamp;
        this.timestamp_formatted = timestamp_formatted;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    static accountsDataExtractor(snsMessage: Object): IRedactedAuditEvent {
        const redactedAuditData: IRedactedAuditEvent = createBaseRedactedAuditEvent();

        redactedAuditData.event_id = JSONPath({
            path: '$.event_id',
            json: snsMessage,
        })[0];

        redactedAuditData.event_name = JSONPath({
            path: '$.event_name',
            json: snsMessage,
        })[0];

        redactedAuditData.client_id = JSONPath({
            path: '$.client_id',
            json: snsMessage,
        })[0];

        redactedAuditData.timestamp = JSONPath({
            path: '$.timestamp',
            json: snsMessage,
        })[0];

        redactedAuditData.timestamp_formatted = JSONPath({
            path: '$.timestamp_formatted',
            json: snsMessage,
        })[0];

        const userId = JSONPath({
            path: '$.user.user_id',
            json: snsMessage,
        })[0];

        if (userId != undefined) {
            (redactedAuditData.user as IRedactedAuditEventUserMessage).user_id = userId;
        }

        const govuk_signin_journey_id = JSONPath({
            path: '$.user.govuk_signin_journey_id',
            json: snsMessage,
        })[0];

        if (govuk_signin_journey_id != undefined) {
            (redactedAuditData.user as IRedactedAuditEventUserMessage).govuk_signin_journey_id =
                govuk_signin_journey_id;
        }

        return redactedAuditData;
    }
}

function createBaseRedactedAuditEventUserMessage(): IRedactedAuditEventUserMessage {
    return {
        user_id: '',
        govuk_signin_journey_id: '',
    };
}
