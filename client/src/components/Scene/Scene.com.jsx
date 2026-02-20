import { Duck } from "@/components/Duck/Duck.com";
import { Tree } from "@/components/Tree/Tree.com";
import { Grass } from "@/components/Grass/Grass.com";
import { GameHud } from "@/components/GameHud/GameHud.com";
import { GameReadyOverlay } from "@/components/GameReadyOverlay/GameReadyOverlay.com";
import css from "./Scene.module.css";

export const Scene = () => {
    return <div className={css.Scene}>
        <Duck />
        <Tree />
        <Grass />
        <GameHud />
        <GameReadyOverlay />
    </div>
}