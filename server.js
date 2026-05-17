import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import setupSocket from "./utils/socket.js";

export const server = createServer(app);

const io = new Server(server);

setupSocket(io);