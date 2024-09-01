const getMessages = (text, username) => {
    return {
        text,
        username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (url, userInfo) => {
    return {
        url,
        username: userInfo.username,
        createdAt: new Date().getTime()
    }
}

module.exports = { getMessages, generateLocationMessage };