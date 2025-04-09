import mitt from "mitt";

export const DEPOSIT_COMPLETED_EVENT = "DEPOSIT_COMPLETED_EVENT";
export const WITHDRAWAL_COMPLETED_EVENT = "WITHDRAWAL_COMPLETED_EVENT";

export type InternalEvent =
    | {
        type: typeof DEPOSIT_COMPLETED_EVENT;
        // Add other properties if needed, for example:
        // depositId: number;
        // amount: number;
    }
    | {
        type: typeof WITHDRAWAL_COMPLETED_EVENT;
    };


export type InternalEventMap = {
    [K in InternalEvent['type']]: Extract<InternalEvent, { type: K }>;
};

export const InternalEventEmitter = mitt<InternalEventMap>();