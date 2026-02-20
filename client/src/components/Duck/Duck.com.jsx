import { useRef, useEffect } from "react";
import { onRoundStart, offRoundStart } from "@/Events/GameEvents";
import { gameStore } from "@/Store/Game.store";
import { getSocket } from "@/Socket.io/Connection";
import css from "./Duck.module.css";

// const TILE = 32;
const TILES_X = 25; // 800 / 32
const TILES_Y = 16; // 512 / 32
const HALF_X = Math.floor(TILES_X / 2);
const FLOOR = TILES_Y - 2;

export const Duck = () => {

    // Refs
    const duckEl = useRef(null);
    const startTimeRef = useRef(null);
    const duckState = useRef('fly'); // fly | hit
    const rafRef = useRef(null);
    // const restartTimeoutRef = useRef(null);
    const hitTimeoutRef = useRef(null);
    // const waitTimeoutRef = useRef(null);
    const quackRef = useRef(new Audio('/assets/sounds/quack.mp3'));
    const awpRef = useRef(new Audio('/assets/sounds/awp.mp3'));

    // Play awp sound
    const playAwp = () => {
        awpRef.current.volume = 0.25;
        awpRef.current.currentTime = 0;
        awpRef.current.play();
    };

    // Play quark sound
    const playQuark = () => {
        quackRef.current.volume = 0.25;
        quackRef.current.currentTime = 0;
        quackRef.current.play();
    };

    // Stop quark sound
    const stopQuark = () => {
        quackRef.current.pause();
        quackRef.current.currentTime = 0;
    };

    // Get random tile X
    const getRandomTileX = (max) => Math.floor(Math.random() * max);

    // Handle start round
    const startRound = () => {

        // Increase round
        gameStore.startRound();

        const startX = getRandomTileX(HALF_X);
        duckState.current = 'fly';
        startTimeRef.current = performance.now();
        // const startX = 1;

        // Set initial position
        duckEl.current.style.setProperty('--tile-x', startX);
        duckEl.current.style.setProperty('--tile-y', FLOOR);
        duckEl.current.style.setProperty('--scale', 1);
        duckEl.current.style.setProperty('--frame', 0);

        // Play duck sound
        playQuark();

        // RAF
        rafRef.current = requestAnimationFrame((time) => fly(time, startX));
    };

    // Reset duck
    const resetDuck = () => {
        duckEl.current.style.setProperty('--tile-x', 0);
        duckEl.current.style.setProperty('--tile-y', FLOOR);
        duckEl.current.style.setProperty('--scale', 1);
        duckEl.current.style.setProperty('--frame', 0);
    };

    // Fly
    const fly = (time, startX) => {
        
        // Ignore extra frame when hit
        if (duckState.current === 'hit') return;
        
        const duration = 5000;
        const elapsedTime = time - startTimeRef.current;
        const progress = elapsedTime / duration;
        const frame = Math.floor(elapsedTime / 150) % 3;
        
        // Stop
        if (elapsedTime >= duration) {
            cancelAnimationFrame(rafRef.current);
            resetDuck();
            // restartTimeoutRef.current = setTimeout(startRound, 5000);
            getSocket()?.emit('game:ready');
            return;
        }

        // Calc X
        const distanceX = (elapsedTime / duration) * HALF_X;
        const newX = startX + distanceX;

        // Calc Y
        const startY = TILES_Y - 2;
        const distanceY = (elapsedTime / duration) * Math.floor(TILES_Y * 0.75); // ≈75% Height
        const newY = startY - distanceY;

        // Scale
        const scale = 1.25 - progress;

        // Apply styles
        duckEl.current.style.setProperty('--tile-x', newX);
        duckEl.current.style.setProperty('--tile-y', newY);
        duckEl.current.style.setProperty('--scale', scale);
        duckEl.current.style.setProperty('--frame', frame);

        // RAF
        rafRef.current = requestAnimationFrame((time) => fly(time, startX));
    };

    // Handle Shoot
    const handleShoot = () => {
        if (duckState.current === 'hit') return;
        duckState.current = 'hit';

        // Increase Hits
        gameStore.increaseHits();

        // Play awp
        playAwp();

        // Stop sound
        stopQuark();

        // Stop RAF
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;

        // Display hit frame
        duckEl.current.style.setProperty('--frame', 3);

        // Wait 3 sec
        hitTimeoutRef.current = setTimeout(() => {
            resetDuck();

            // waitTimeoutRef.current = setTimeout(startRound, 2000);
            getSocket()?.emit('game:ready');
        }, 3000);
    };

    // Did mount
    useEffect(() => {
        const handler = () => startRound();
        onRoundStart(handler);

        return () => {
            offRoundStart(handler);
            cancelAnimationFrame(rafRef.current);
            // clearTimeout(restartTimeoutRef.current);
            clearTimeout(hitTimeoutRef.current);
            // clearTimeout(waitTimeoutRef.current);
        }
    }, []);

    // console.log('Render Duck');
    return <div ref={duckEl} className={css.Duck} style={{'--tile-x': 0, '--tile-y': FLOOR}} onClick={handleShoot}></div>
}