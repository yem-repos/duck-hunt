import css from "./Grass.module.css";

export const Grass = () => {
    return <div className={css.Grass} onClick={(e) => e.stopPropagation()}></div>
}