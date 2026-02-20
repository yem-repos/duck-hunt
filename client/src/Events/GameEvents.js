export const gameEvents = new EventTarget();

// Round start event
export const emitRoundStart = () => {
    gameEvents.dispatchEvent(new Event('round:start'));
};

export const onRoundStart = (handler = () => {}) => {
    gameEvents.addEventListener('round:start', handler);
};

export const offRoundStart = (handler = () => {}) => {
    gameEvents.removeEventListener('round:start', handler);
};