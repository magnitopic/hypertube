// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';

export const authStatusSocketMiddleware =
    (socket, protectedEvents) => (packet, next) => {
        if (protectedEvents.includes(packet[0])) {
            if (!socket.request.session.user) {
                console.info('INFO:', StatusMessage.FORBIDDEN_ACCESS_EVENT);
                socket.emit('error-info', {
                    msg: StatusMessage.FORBIDDEN_ACCESS_EVENT,
                });
                return;
            }
        }
        next();
    };
