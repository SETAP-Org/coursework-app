import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import setupSocket from "./utils/socket.js";

const server = createServer(app);
const io = new Server(server);
setupSocket(io);

// start server
server.listen(3000, () => {
    console.log("Server running on http://localhost:3000/ :P");
});