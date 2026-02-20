import { useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { gameStore } from "@/Store/Game.store";
import { getSocket } from "@/Socket.io/Connection";
import css from "./GameReadyOverlay.module.css";

export const GameReadyOverlay = observer(() => {

    // Store
    const { ready } = gameStore;
    
    // Refs
    const sound = useRef(new Audio('/assets/sounds/game_start.mp3'));

    // Play sound
    const playSound = () => {
        sound.current.currentTime = 4;
        sound.current.volume = 0.1;
        sound.current.play();
    };
    
    // Handle Start
    const handleStart = async () => {
        if (ready === true) return;
        playSound();
        gameStore.setGameReady();
    };

    // Did Mount
    useEffect(() => {
        const audio = sound.current;
        const handler = () => getSocket()?.emit('game:ready');

        sound.current.onended = handler;
        return () => {
            audio.onended = null;
        };
    }, []);

    // console.log('RENDER', 'GameOverlay');
    return ready ? null : <div className={css.GameReadyOverlay}>

        {/* Get Ready Button */}
        <div className={css.StartButton} onClick={handleStart}>Ready</div>
    </div>
});