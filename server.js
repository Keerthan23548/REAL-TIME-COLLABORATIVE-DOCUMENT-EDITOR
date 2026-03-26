const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const Document = require("./Document");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/collab-editor", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.on("get-document", async (id) => {
    const document = await findOrCreateDocument(id);
    socket.join(id);

    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(id).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(id, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  if (!id) return;

  let document = await Document.findById(id);
  if (document) return document;

  return await Document.create({ _id: id, data: "" });
}

server.listen(5000, () => console.log("Server running on port 5000"));