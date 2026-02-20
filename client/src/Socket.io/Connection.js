import { io } from "socket.io-client";
import { emitRoundStart } from "@/Events/GameEvents";

const URL = 'http://localhost:3001';
let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(URL);

    // On round start
    socket.on('round:start', () => {
        console.log('On round start');
        emitRoundStart();
    });
  }
  return socket;
};

export const getSocket = () => socket;