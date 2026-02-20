import css from "./Tree.module.css";

export const Tree = () => {
    return <div className={css.Tree} onClick={(e) => e.stopPropagation()}></div>
}