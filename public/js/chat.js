const socket = io()

// Elements
const $messageForm = document.querySelector("#message_form");
const $messageFormInput = document.querySelector("#message_form_input");
const $messageFormButton = document.querySelector("#message_form_button");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-url-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// action buttons
const $sendLocationButton = document.querySelector("#send-location");
const $leave_chat_button = document.querySelector("#leave_chat_button");

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible Height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('locationMessage', (locationInformation) => {
    console.log(locationInformation);
    const locationHtml = Mustache.render(locationTemplate, {
        url: locationInformation.url,
        userName: locationInformation.username,
        createdAt: moment(locationInformation.createdAt).format("ddd, hh:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", locationHtml);
    autoScroll();
})

socket.on('message', (message) => {
    // console.log(message);
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        userName: message.username,
        createdAt: moment(message.createdAt).format("ddd, hh:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
})

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html;
    document.querySelector("#mobile_sidebar").innerHTML = html;
})

socket.on('coords', (coords) => {
    console.log(coords);
})

$leave_chat_button.addEventListener('click', () => {
    location.href = "/";
})

document.querySelector("#message_form").addEventListener('submit', (e) => {
    e.preventDefault();

    // disable the form
    $messageFormButton.setAttribute("disabled", "disabled");

    const message = e.target.elements.message.value;

    socket.emit("sendMessage", { message }, (error) => {

        // re-enable the form
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }

        console.log('Message Delivered!');
    });
})

// to send the location
document.querySelector("#send-location").addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.");
    }

    navigator.geolocation.getCurrentPosition((position) => {

        // disable the send-location button
        $sendLocationButton.setAttribute("disabled", "disabled")

        socket.emit("sendLocation", {
            location: {
                longitude: position.coords.longitude,
                latitude: position.coords.latitude
            },
        },
            () => {

                // re-enable the send-location button
                $sendLocationButton.removeAttribute("disabled");

                console.log("Location Shared!");
            });
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        window.history.go();
        window.location.href = "/";
    }
})



/** -----Practice-------- */

/* socket.on("receive_message", (message) => {
    console.log("received: ", message);
}) */

// socket.on('countUpdated', (counter) => {
//     console.log('The count has been updated!', counter);
// })

// const incrementButton = document.querySelector('#button_increment');

// incrementButton.addEventListener('click', () => {
//     console.log('clicked');
//     socket.emit('increment');
// })