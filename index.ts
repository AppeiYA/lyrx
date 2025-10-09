import * as dotenv from "dotenv";
dotenv.config();
import app from "./src/app";
import { Server } from "socket.io";
import http from "http";

const server = http.createServer(app);

// create socket io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});

export { io };

const PORT: string = process.env.PORT || "3000";

server.listen(PORT, () => {
  console.log(
    "Server is running at http://localhost:" + PORT + " .CTRL+C to terminate."
  );
});
