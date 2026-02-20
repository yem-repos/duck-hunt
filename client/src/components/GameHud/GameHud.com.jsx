import { observer } from "mobx-react-lite";
import { gameStore } from "@/Store/Game.store";
import css from "./GameHud.module.css";

export const GameHud = observer(() => {

    // Store
    const { ready, hits, round } = gameStore;
    
    return ready && <div className={css.GameHud}>
        
        {/* Rounds */}
        <div> 
            <span>Round:</span>
            <span>{round || 1}</span>
        </div>

        {/* Hits */}
        <div>
            <span>Hits:</span>
            <span>{hits}</span>
        </div>
    </div>
});