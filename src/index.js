const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { getMessages, generateLocationMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');
const admin = "Admin";

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('join', (userInformations, callback) => {
        // store and get back the user or the error
        const { error, user } = addUser({ id: socket.id, ...userInformations });

        if(error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', getMessages('Welcome', admin));
        socket.broadcast.to(user.room).emit('message', getMessages(`${user.username} has joined!`, admin));
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })

    socket.on('sendMessage', (information, callback) => {
        const filter = new Filter();
        const user = getUser(socket.id);

        if(filter.isProfane(information.message)) {
            return callback('Profanity is not allowed!');
        }

        io.to(user.room).emit("message", getMessages(information.message, user.username));
        callback('Delivered!');
    });

    socket.on('sendLocation', (information, callback) => {
        const user = getUser(socket.id);
        const { latitude, longitude } = information.location;
        io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`, user));
        callback();
    })

    socket.on('disconnect', () => {
        console.log("getting", socket.id);
        const leftUser = removeUser(socket.id);

        if(leftUser) {
            io.to(leftUser.room).emit("message", getMessages(`${leftUser.username} has left!`, admin));
            io.to(leftUser.room).emit("roomData", {
                room: leftUser.room,
                users: getUsersInRoom(leftUser.room)
            })
        }
    })

    socket.on("leaveChat", () => {
        const user = getUser(socket.id);
        console.log("leaving chat", user);
    })
})
 
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})



/** ----- Practice ----- */

// let count = 0;
// server (emit) -> client (receive) --Acknowledgement---> Server countUpdated
// client (emit) -> server (receive) --Acknowledgement---> client - increment
    
// socket.emit('countUpdated', count);

// socket.on('increment', () => {
//     count++;

//   // socket.emit('countUpdated', count); // emits an event to a specific connection

//     io.emit('countUpdated', count); // emits an event to every single connection
// })
