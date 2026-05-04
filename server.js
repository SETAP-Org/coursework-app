// ===== imports =====
// package imports
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// route imports
import pageRoutes from "./routes/pageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import notificationRoutes from "./routes/notificationsRoutes.js";
import contributionsRoutes from "./routes/contributionsRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

// util imports
import createSession from "./utils/session.js";
import setUpAuth from "./utils/auth.js";
import setupSocket from "./utils/socket.js";

// configure environment variables
dotenv.config({ path: ".env.auth" });

// configuration data for server
const __dirname = import.meta.dirname;
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 3000;

// middleware
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());
createSession(app);
setUpAuth(app);

// socket io setup
setupSocket(io);

// route mounting
app.use("/", pageRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", projectRoutes);
app.use("/api", taskRoutes);
app.use("/api", calendarRoutes);
app.use("/api", notificationRoutes);
app.use("/api", contributionsRoutes);
app.use("/api", noteRoutes);
app.use("/api", fileRoutes);

// start server
server.listen(port, () => {
  console.log("Server running on http://localhost:3000/ :P");
});
