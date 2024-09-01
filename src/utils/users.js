const users = [];

const addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if(!username || !room) {
        return {
            error: "Username and room are required!"
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => user.room === room && user.username === username);

    // validate username
    if(existingUser) {
        return {
            error: "Username is in use!"
        }
    }

    // Store user
    const user = { id, username, room };
    users.push(user);
    return { user };
}

// remove the user
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// get user
const getUser = (id) => {
    const user = users.find((u) => u.id === id);
    return user;
}

// get users in room
const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => user.room == room.trim().toLowerCase());
    return usersInRoom ?? [];
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};