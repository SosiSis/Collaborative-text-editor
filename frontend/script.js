const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");

let drawing = false;
let color = document.getElementById("color").value;
let size = document.getElementById("size").value;
let lastPosition = null;

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get("room");
    console.log("Room parameter:", room);
    document.getElementById("roomName").textContent = room || "Unnamed Room";
});

// Update color and size when user selects them
document.getElementById("color").addEventListener("change", (e) => {
    color = e.target.value;
});

document.getElementById("size").addEventListener("change", (e) => {
    size = e.target.value;
});

// WebSocket connection
const ws = new WebSocket("ws://localhost:8080/ws");

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    drawOnCanvas(data, true);
};

canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    lastPosition = { x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top };
});

canvas.addEventListener("mousemove", (e) => {
    if (drawing) {
        draw(e);
    }
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
    lastPosition = null;
});

canvas.addEventListener("mouseout", () => {
    drawing = false;
    lastPosition = null;
});

function draw(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (!lastPosition) {
        lastPosition = { x, y };
    }
    
    const data = { x, y, lastX: lastPosition.x, lastY: lastPosition.y, color, size, newPath: lastPosition === null };
    ws.send(JSON.stringify(data));
    
    drawOnCanvas(data, false);
    lastPosition = { x, y };
}

function drawOnCanvas(data, isRemote) {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = "round";
    
    if (data.newPath || !data.lastX || !data.lastY) {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
    } else {
        ctx.beginPath();
        ctx.moveTo(data.lastX, data.lastY);
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
    }
}
