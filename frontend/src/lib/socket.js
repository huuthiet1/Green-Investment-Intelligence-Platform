import { io } from "socket.io-client";

const socket = io(
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "/",
  {
    withCredentials: true,
    autoConnect: true,
  }
);

export default socket;