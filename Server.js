import dotenv from 'dotenv'
import express from 'express'
import { Server } from 'socket.io'
import path from 'path'
import http from 'http'
import cors from 'cors'
import { fileURLToPath } from 'url'

dotenv.config()
const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.LOCALHOST,
        methods: ['GET', "POST"]
    }
})
// console.log(io);

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middlewares for server
app.use(cors())
app.use(express.json())

// Serve static files
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use(cors({
    origin: 'https://chatbot-frontend-de18.onrender.com',
}));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});


// Socket.io Connection
io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Join room
    socket.on('joinRoom', ({ username, room }) => {
        socket.join(room);
        // socket.emit('message', {
        //     user: 'admin',
        //     text: `${username}, welcome to ${room}`,
        //     timestamp: new Date()
        // });
        // socket.broadcast.to(room).emit('message', {
        //     user: 'admin',
        //     text: `${username} has joined!`,
        //     timestamp: new Date()
        // });
    });

    // Send message
    socket.on('sendMessage', ({ username, room, message }) => {
        io.to(room).emit('message', {
            user: username,
            text: message,
            timestamp: new Date()
        });
        console.log(username, room, message);

    });

    // Typing indicator
    socket.on('typing', ({ username, room, isTyping }) => {
        socket.broadcast.to(room).emit('typing', { username, isTyping });
        console.log('typing', username, room, isTyping);

    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
// https://chatbot-backend-l5r0.onrender.com

app.get('/', (req, res) => {
    res.send('Backend is running...')
})



const port = process.env.PORT || 3001
server.listen(port, () => {
    console.log(`The port is connect to http://localhost:${port}`);

})