const socket = io()


// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('#mssg')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const siderbarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


// autoscroll messages
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Listening Chat text messages
socket.on('message', ({ username, text, createdAt }) => {
    const html = Mustache.render(messageTemplate, {
        username: username,
        message: text,
        createdAt: moment(createdAt).format('HH:mm a')   // moment is formatting date and time
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


// Listening Chat location messages
socket.on('locationMessage', ({ username, url, createdAt }) => {
    // console.log(url)
    const html = Mustache.render(locationTemplate, {
        username: username,
        url: url,
        createdAt: moment(createdAt).format('HH:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


// Listening Room Data
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(siderbarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// Handling message form
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value;
    socket.emit('sendMessage', { message, username, room }, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return alert(error)
        }
        // console.log('Message Delivered!')
    })

})


// Handling Location click
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Sorry! Your browser does not support Geolocation')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((location) => {
        socket.emit('sendLocation', {
            lat: location.coords.latitude,
            long: location.coords.longitude,
            username: username,
            room: room
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            // console.log('Location Shared!')
        })
    });
})


// join user to chat room
socket.emit('join', { username, room }, (error) => {
    // if there is any error while joining room redirect them back to join page
    if (error) {
        alert(error)
        return location.href = '/'
    }
})