// Chat text Message Generator
const generateMessage = (username, message) => {
    return {
        username: username,
        text: message,
        createdAt: new Date().getTime()
    }
}


// Chat location Message Generator
const generateLocationMessage = (username, url) => {
    return {
        username: username,
        url: url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}