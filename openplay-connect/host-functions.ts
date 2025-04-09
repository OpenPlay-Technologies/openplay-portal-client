import { BALANCE_UPDATE_NOTIFICATION, Message } from "./messages";

export function notifyBalanceUpdate(targetWindow: Window) {
    const message: Message = {
        type: BALANCE_UPDATE_NOTIFICATION
    };

    targetWindow.postMessage(message, '*');
}