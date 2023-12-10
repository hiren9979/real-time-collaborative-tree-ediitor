const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const db = require("./config/db");
const ACTIONS = require("./actions/Actions");

const authenticate = require("./middleware/authenticationMiddleware");
const authRoutes = require("./controllers/authController");
const documentRoutes = require("./controllers/documentController");

const documentService = require("./services/documentService");
const userService = require("./services/userService");

const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);

// Use routes
app.use("/auth", authRoutes);
app.use("/document", authenticate, documentRoutes);

io.on("connection", (socket) => {
  // for joining room
  socket.on(ACTIONS.JOIN, async ({ roomId, username, user_id }) => {
    const [clients] = await userService.getAllConnectedClients(roomId);

    const clientIndex = clients.findIndex((client) => {
      return client.user_id === user_id;
    });
    if (clientIndex === -1) {
      await db
        .promise()
        .query(
          "INSERT INTO user_presence (user_id,is_online,socket_id) Values (?,?,?) ",
          [user_id, true, socket.id]
        );
      clients.push({ socket_id: socket.id, user_id, username });
      socket.join(roomId);
    } else {
      await db
        .promise()
        .query("Update user_presence set socket_id  = ? where user_id = ?", [
          socket.id,
          user_id,
        ]);

      clients[clientIndex] = { ...clients[clientIndex], socket_id: socket.id };
    }

    if (Array.isArray(clients)) {
      clients.forEach(({ socket_id }) => {
        io.to(socket_id).emit(ACTIONS.JOINED, {
          clients,
          username,
          socketId: socket.id,
        });
      });
    } else {
      console.log("Clients data is not an array:", clients);
    }
  });

  // for sync
  socket.on(ACTIONS.TREE_CHANGE, async ({ roomId, nodes }) => {
    nodes = await documentService.getAllNodesData();
    io.to(roomId).emit(ACTIONS.TREE_CHANGE, { nodes });
  });

  socket.on(ACTIONS.SYNC_TREE, async ({ socketId, nodes }) => {
    nodes = await documentService.getAllNodesData();
    io.to(socketId).emit(ACTIONS.TREE_CHANGE, { nodes });
  });

  // disconnecting from socket
  socket.on("disconnecting", async () => {
    const rooms = [...socket.rooms];
    const [user_presence] = await db
      .promise()
      .query(
        "SELECT u.username from user_presence up INNER JOIN users u ON u.user_id = up.user_id where socket_id = ?",
        [socket.id]
      );

    if (user_presence[0]) {
      rooms.forEach((roomId) => {
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: user_presence[0].username,
        });
      });

      await db
        .promise()
        .query("DELETE from user_presence where socket_id = ?", [socket.id]);
      socket.leave();
    }
  });

  socket.on(ACTIONS.LEAVE_ROOM, async ({ roomId, username, user_id }) => {
    const [user_presence] = await db
      .promise()
      .query("SELECT * from user_presence where user_id = ?", [user_id]);
    const leavingSocketId = user_presence[0]?.socket_id;

    if (leavingSocketId) {
      socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: leavingSocketId,
        username: username,
      });

      await db
        .promise()
        .query("DELETE from user_presence where socket_id = ?", [
          leavingSocketId,
        ]);
    }
  });
});

// port listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
