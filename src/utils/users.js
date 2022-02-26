const users = []

// addUser
const addUser = ({ id, username, room }) => {
    // clean the data 
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data 
    if (!username || !room) {
        return {
            error: 'First enter username and room'
        }
    }

    // Check existing user --> users with same name and room can't join so username must be unique
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'User already exists in room'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}


// removeUser
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    // console.log(index)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}


// getUser 
const getUser = (id) => {
    return users.find((user) => user.id === id)
}


// getUsersInRoom
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     id: 61,
//     username: 'vaibhav',
//     room: 'coders'
// })

// const user = getUser(61)
// console.log(user)