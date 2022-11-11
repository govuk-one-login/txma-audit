import { JSONPath } from 'jsonpath-plus';


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
        user: createBaseRedactedAuditEventUserMessage(),
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
    }

    static accountsDataExtractor(snsMessage: Object): IRedactedAuditEvent {
        const redactedAuditData: IRedactedAuditEvent = createBaseRedactedAuditEvent();

        redactedAuditData.event_id = JSONPath({
            path: "$.event_id",
            json: snsMessage
        })[0];

        redactedAuditData.event_name = JSONPath({
            path: "$.event_name",
            json: snsMessage
        })[0];
        redactedAuditData.timestamp = JSONPath({
            path: "$.timestamp",
            json: snsMessage
        })[0];

        redactedAuditData.timestamp_formatted = JSONPath({
            path: "$.timestamp_formatted",
            json: snsMessage
        })[0];

        redactedAuditData.reIngestCount = JSONPath({
            path: "$.reIngestCount",
            json: snsMessage
        })[0];


         const  userId = JSONPath({
             path: "$.user.user_id",
             json: snsMessage
         })[0] ;

         if (userId != undefined) {
             (redactedAuditData.user as IRedactedAuditEventUserMessage).user_id =  userId;
         }

        const govuk_signin_journey_id = JSONPath({
            path: "$.user.govuk_signin_journey_id",
            json: snsMessage
        })[0];

         if (govuk_signin_journey_id !=undefined) {
            (redactedAuditData.user as IRedactedAuditEventUserMessage).govuk_signin_journey_id = govuk_signin_journey_id;
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

