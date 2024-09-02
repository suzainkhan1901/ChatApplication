const socket = new WebSocket('ws://localhost:3000');
const messagesDiv = document.getElementById('messages');
const roomListDiv = document.getElementById('room-list');
const roomNameInput = document.getElementById('room-name');
const usernameInput = document.getElementById('username');
const joinButton = document.getElementById('join');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');

let currentRoom = '';
let username = '';

// Join chat room
joinButton.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        socket.send(JSON.stringify({ type: 'join', username }));
        messageInput.disabled = false;
        sendButton.disabled = false;
        usernameInput.disabled = true;
        joinButton.disabled = true;
    }
});

// Send message
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message && currentRoom) {
        socket.send(JSON.stringify({ type: 'message', room: currentRoom, username, message }));
        messageInput.value = '';
    }
});

// Create room
document.getElementById('create-room').addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName) {
        socket.send(JSON.stringify({ type: 'create', room: roomName }));
        roomNameInput.value = '';
    }
});

// Handle incoming messages
socket.addEventListener('message', (event) => {
    const { type, room, username, message } = JSON.parse(event.data);
    if (type === 'roomList') {
        updateRoomList(room);
    } else if (type === 'message') {
        displayMessage(username, message);
    }
});

// Update room list on UI
function updateRoomList(rooms) {
    roomListDiv.innerHTML = '';
    rooms.forEach(room => {
        const roomElement = document.createElement('div');
        roomElement.textContent = room;
        roomElement.addEventListener('click', () => {
            currentRoom = room;
            socket.send(JSON.stringify({ type: 'joinRoom', room }));
            messagesDiv.innerHTML = '';
        });
        roomListDiv.appendChild(roomElement);
    });
}

// Display message in chat
function displayMessage(username, message) {
    const msgElement = document.createElement('div');
    msgElement.textContent = `${username}: ${message}`;
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll
}

// Request room list on connection
socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'getRooms' }));
});