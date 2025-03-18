import { ErrorHandler } from "./errors";

/**
 * Handler for responses to API requests.
 */
export class ResponseHandler {
    public success!: boolean;
    public message!: string;
    public data?: any; 
    public error?: ErrorHandler;

    constructor(success: boolean, message: string, data?: any, error?: ErrorHandler) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
    }
}