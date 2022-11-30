export interface ILogDetails {
    resourceName: string;
    eventName: string;
    eventId: string | undefined;
    timestamp: string | undefined;
    message: string;
}
