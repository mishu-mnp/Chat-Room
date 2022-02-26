const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server);


const port = 3000;
// public dir to serve html files
const publicDirectoryPath = path.join(__dirname, '../public');

// set express to serve static files
app.use(express.static(publicDirectoryPath))


// do something when new client connects
io.on('connection', (socket) => {
    // console.log('New Web Socket Connection')
    const admin = 'Alix Messer'

    // join users listener
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage(admin, `Welcome! ${user.username}`))
        socket.broadcast.to(user.room).emit('message', generateMessage(admin, `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    // Send Message when user hits sendMessage event from client side
    socket.on('sendMessage', ({ message }, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()
        filter.addWords('mc', 'bc', 'wtf', 'bsdk');   // add custom profanity words
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()  // To acknowledge the current user for message delievery
    })

    // Send Location when user hits sendLocation event from client side
    socket.on('sendLocation', ({ lat, long }, callback) => {
        const user = getUser(socket.id)
        const url = `https://google.com/maps?q=${lat},${long}`;
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, url))
        callback()
    })

    // When user disconnects/leaves chat then sent this built in disconnect event
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            // send message to other users when any user leaves the chat
            io.to(user.room).emit('message', generateMessage(admin, `${user.username} has left!`))
            // update sidebar room data
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})


server.listen(port, () => { })
