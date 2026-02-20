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
const SPEED = HALF_X / 5; // 2.4 tiles per second

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
    const lastTimeRef = useRef(null);
    const directionRef = useRef(1); // 1 | -1
    const nextSwitchRef = useRef(0);

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
        lastTimeRef.current = null;
        directionRef.current = Math.random() > 0.5 ? 1 : -1;
        nextSwitchRef.current = startTimeRef.current + 1250;
        
        // Set initial position
        duckEl.current.style.setProperty('--tile-x', startX);
        duckEl.current.style.setProperty('--tile-y', FLOOR);
        duckEl.current.style.setProperty('--scale', 1);
        duckEl.current.style.setProperty('--frame', 0);
        duckEl.current.style.setProperty('--dir', 1);

        // Play duck sound
        playQuark();

        // RAF
        rafRef.current = requestAnimationFrame((time) => fly(time, startX, FLOOR));
    };

    // Fly
    const fly = (time, currentX, currentY) => {

        // Ignore extra frame when hit
        if (duckState.current === 'hit') return;
        
        // First frame
        if (lastTimeRef.current === null) {
            lastTimeRef.current = time;
            rafRef.current = requestAnimationFrame((time) => fly(time, currentX, currentY));
            return;
        }

        // Elapsed time & progress calculation
        const duration = 5000;
        const elapsedTime = time - startTimeRef.current;
        const progress = elapsedTime / duration;

        // Stop
        if (progress >= 1) {
            cancelAnimationFrame(rafRef.current);
            resetDuck();
            getSocket()?.emit('game:ready');
            return;
        }

        // Delta
        const delta = time - lastTimeRef.current;
        const deltaSec = delta / 1000;
        lastTimeRef.current = time;

        if (time >= nextSwitchRef.current) {
            directionRef.current *= Math.random() >= 0.75 ? -1: 1;
            nextSwitchRef.current += 1250;
        }

        // Get next coords
        const nextX = currentX + SPEED * deltaSec * directionRef.current;
        const nextY = currentY - SPEED * deltaSec * (progress >= 0.75 ? directionRef.current : 1);

        // Get frame and scale
        const frame = Math.floor(elapsedTime / 150) % 3;
        const scale = 1.25 - progress;

        // Apply styles
        duckEl.current.style.setProperty('--tile-x', nextX);
        duckEl.current.style.setProperty('--tile-y', nextY);
        duckEl.current.style.setProperty('--frame', frame);
        duckEl.current.style.setProperty('--scale', scale);
        duckEl.current.style.setProperty('--dir', directionRef.current);
        
        // RAF
        rafRef.current = requestAnimationFrame((time) => fly(time, nextX, nextY));
    };

    // Reset duck
    const resetDuck = () => {
        duckEl.current.style.setProperty('--tile-x', 0);
        duckEl.current.style.setProperty('--tile-y', FLOOR);
        duckEl.current.style.setProperty('--scale', 1);
        duckEl.current.style.setProperty('--frame', 0);
        duckEl.current.style.setProperty('--dir', 1);
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