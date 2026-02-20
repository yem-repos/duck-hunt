const server = require('http').createServer();
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
});

// On Connection
io.on('connection', (client) => {
    console.log('Client connected', client.id);

    // On game ready
    client.on('game:ready', () => {
        const delay = Math.random() * 5000 + 5000; // 5 - 10 sec

        setTimeout(() => {
            console.log('DUCK DUCK GO', client.id);
            client.emit('round:start');
        }, delay);
    });
});

server.listen(3001);
