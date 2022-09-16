export class ErrorService {
    static isErrorType(error: unknown): error is ErrorWithMessage {
        return (
            typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof (error as Record<string, unknown>).message === 'string'
        );
    }

    static toErrorWithMessage(error: unknown): ErrorWithMessage {
        if (this.isErrorType(error)) return error;

        try {
            return new Error(JSON.stringify(error));
        } catch {
            // fallback in case there's an error stringifying the error
            // like with circular references for example.
            return new Error(String(error));
        }
    }
}
