export interface ISplunkDeliveryFailureRecord {
    attemptsMade: number;
    arrivalTimestamp: number;
    errorCode: string;
    errorMessage: string;
    attemptEndingTimestamp: string;
    rawData: string;
    EventId: string;
}
