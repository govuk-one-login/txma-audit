export interface ILogDetails {
    sqsResourceName: string;
    eventName: string;
    eventId: string;
    timestamp: string | undefined;
    message: string;
}
