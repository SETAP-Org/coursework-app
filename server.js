import express from "express";
import path from "path";
import { getAllUsersController } from "./controllers/userControllers.js";

const __dirname = import.meta.dirname;

const app = express();

const port = 3000;
app.use(express.static(path.join(__dirname, "public")));

// paths to navigate pages
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages", "index.html"));
});

app.get("/user-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages", "user_dashboard.html"));
});

app.listen(port, () => {
  console.log("Server running on http://localhost:3000/");
});

// API routes
app.get("/api/users/all", getAllUsersController)
