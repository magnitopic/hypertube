// Third-Party Imports:
import { Server } from 'socket.io';

// Local Imports:
import { socketSessionMiddleware } from '../Middlewares/socketSessionMiddleware.js';
import { authStatusSocketMiddleware } from '../Middlewares/authStatusSocketMiddleware.js';
import { handleError } from '../Utils/socketUtils.js';

class SocketHandler {
    constructor(server) {
        if (SocketHandler.instance) return SocketHandler.instance;

        this.io = new Server(server, {
            cors: {
                origin: 'http://localhost:3000',
                credentials: true,
            },
        });
        this.PROTECTED_EVENTS = [];

        this.#setupConnectionMiddleware();
        this.#handleSocket();

        SocketHandler.instance = this;
    }

    static getInstance(server) {
        if (!SocketHandler.instance)
            SocketHandler.instance = new SocketHandler(server);

        return SocketHandler.instance;
    }

    getIo() {
        return this.io;
    }

    #setupConnectionMiddleware() {
        this.io.use(socketSessionMiddleware());
    }

    #setupSocketMiddleware(socket) {
        socket.use(authStatusSocketMiddleware(socket, this.PROTECTED_EVENTS));
    }

    #handleSocket() {
        this.io.on('connection', async (socket) => {
            console.info(`INFO: New socket connected: ${socket.id}`);

            this.#setupSocketMiddleware(socket);

            socket.on('disconnect', async () => {
                console.info(`INFO: Socket disconnected: ${socket.id}`);
            });
        });
    }
}

export default SocketHandler;
