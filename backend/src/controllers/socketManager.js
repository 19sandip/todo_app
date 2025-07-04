import {Server} from 'socket.io';

 const socketManager = (server) =>{
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });


    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });

        // Add more event listeners as needed
    });

    return io;
}

export default socketManager;
