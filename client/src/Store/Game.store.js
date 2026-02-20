import { makeAutoObservable } from "mobx";
import { connectSocket } from "@/Socket.io/Connection";

class Game {
    round = 0;
    hits = 0;
    ready = false;

    constructor () {
        makeAutoObservable(this);
        this.initSocket();
    }

    initSocket() {
        connectSocket();
    }

    increaseRound() {
        this.round = this.round + 1;
    }

    increaseHits() {
        this.hits = this.hits + 1;
    }

    setGameReady() {
        this.ready = true;
    }

    startRound () {
        this.increaseRound();
    }
}

export const gameStore = new Game();