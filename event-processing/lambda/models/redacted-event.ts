import {ICleansedEvidenceEvent, ICleansedExtensionsEvent, ICleansedUserEvent} from "./cleansed-event";

export interface IRedactedAuditEvent {
    event_id: string;
    timestamp: number;
    timestamp_formatted: string;
    event_name: string;
    user?: IRedactedAuditEventUserMessage | undefined;
    reIngestCount: number;
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
        user: undefined,
        reIngestCount: 0,
    };
}

export class RedactedAuditEvent  implements  IRedactedAuditEvent {

    readonly event_id: string;
    readonly event_name: string;
    readonly timestamp: number;
    readonly timestamp_formatted: string;
    readonly user?: IRedactedAuditEventUserMessage | undefined
    readonly reIngestCount: number;

    constructor(
        event_id: string,
        event_name: string,
        timestamp: number,
        timestamp_formatted: string,
        reIngestCount: number,
        user?: unknown | undefined,
    ) {
        this.event_id = event_id;
        this.event_name = event_name;
        this.timestamp = timestamp;
        this.timestamp_formatted = timestamp_formatted;
        this.reIngestCount = reIngestCount;

        if (user != undefined) {

            if ((user as IRedactedAuditEventUserMessage).govuk_signin_journey_id && !((user as IRedactedAuditEventUserMessage).user_id)) {
                this.user = {
                    govuk_signin_journey_id: (user as IRedactedAuditEventUserMessage).govuk_signin_journey_id,
                } as IRedactedAuditEventUserMessage;
            }

            if ((user as IRedactedAuditEventUserMessage).user_id && !((user as IRedactedAuditEventUserMessage).govuk_signin_journey_id)) {
                this.user = {
                    user_id: (user as IRedactedAuditEventUserMessage).user_id,
                } as IRedactedAuditEventUserMessage;
            }


            if ((user as IRedactedAuditEventUserMessage).govuk_signin_journey_id && (user as IRedactedAuditEventUserMessage).user_id) {
                this.user = {
                    govuk_signin_journey_id: (user as IRedactedAuditEventUserMessage).govuk_signin_journey_id,
                    user_id: (user as IRedactedAuditEventUserMessage).user_id,
                } as IRedactedAuditEventUserMessage;
            }
        }

    }


    static fromJSONString(object: string): IRedactedAuditEvent {
        const event = createBaseRedactedAuditEvent();
        const jsonObject = JSON.parse(object);
        for (const value in jsonObject) {
            switch (value) {
                case 'event_id':
                    event.event_id = jsonObject[value];
                    break;
                case 'timestamp':
                    event.timestamp = jsonObject[value];
                    break;
                case 'timestamp_formatted':
                    event.timestamp_formatted = jsonObject[value];
                    break;
                case 'event_name':
                    event.event_name = jsonObject[value];
                    break;
                case 'user':
                    event.user = RedactedAuditEventUserMessage.fromObject(jsonObject[value]);
                    break;
                case 'reIngestCount':
                    event.reIngestCount = jsonObject[value];
                    break;
            }
        }
        return event;
    }
}

function createBaseRedactedAuditEventUserMessage(): IRedactedAuditEventUserMessage {
    return {
        user_id: '',
        govuk_signin_journey_id: '',
    };
}

export class RedactedAuditEventUserMessage {
    static fromObject(object: any): IRedactedAuditEventUserMessage {
        const user = createBaseRedactedAuditEventUserMessage();
        for (const value in object) {
            switch (value) {
                case 'user_id':
                    user.user_id = object.user_id;
                    break;
                case 'govuk_signin_journey_id':
                    user.govuk_signin_journey_id = object.govuk_signin_journey_id;
                    break;
            }
        }
        return user;
    }
}
