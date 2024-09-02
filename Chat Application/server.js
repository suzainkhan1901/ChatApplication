const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });
const rooms = {};
const users = {};

server.on('connection', (socket) => {
    socket.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'join':
                users[socket] = data.username;
                break;
            case 'create':
                if (!rooms[data.room]) {
                    rooms[data.room] = [];
                    broadcast({ type: 'roomList', rooms: Object.keys(rooms) });
                }
                break;
            case 'joinRoom':
                socket.room = data.room;
                break;
            case 'message':
                broadcast({ type: 'message', room: data.room, username: data.username, message: data.message });
                break;
            case 'getRooms':
                socket.send(JSON.stringify({ type: 'roomList', rooms: Object.keys(rooms) }));
                break;
        }
    });

    socket.on('close', () => {
        delete users[socket];
    });
});

// Broadcast messages to all clients
function broadcast(msg) {
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    });
}

console.log('WebSocket server is running on ws://localhost:3000');