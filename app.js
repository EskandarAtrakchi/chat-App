const socket = new WebSocket("ws://localhost:3000");

const chatContainer = document.getElementById("chat-container");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const fileBtn = document.getElementById("file-btn");

// Append message to chat container
function appendMessage(message, isMine = false) {
    const div = document.createElement("div");
    div.className = isMine ? "my-message" : "other-message";
    div.innerHTML = message;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll
}

// Send text message
sendBtn.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message) {
        appendMessage(message, true);
        socket.send(JSON.stringify({ type: "text", content: message }));
        messageInput.value = "";
    }
});

// Handle file upload
fileBtn.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,video/*";
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result;
                appendMessage(`<img src="${base64}" alt="Uploaded File" style="max-width: 100px;">`, true);
                socket.send(JSON.stringify({ type: "file", content: base64 }));
            };
            reader.readAsDataURL(file);
        }
    });
    fileInput.click();
});

// Receive message
socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "text") {
        appendMessage(data.content);
    } else if (data.type === "file") {
        appendMessage(`<img src="${data.content}" alt="Received File" style="max-width: 100px;">`);
    }
});
