// utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://embroideryfiles.duckdns.org";

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });
  }
  return socket;
};

export const getSocket = () => socket;
