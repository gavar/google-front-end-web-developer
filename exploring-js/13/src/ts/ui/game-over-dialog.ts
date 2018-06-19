import {PlayerStats} from "$game";
import {DialogView} from "$ui";

export class GameOverDialog extends DialogView {

    public replay: HTMLElement;
    public level: HTMLElement;
    public score: HTMLElement;
    public stats: PlayerStats;

    /** @inheritDoc */
    protected initialize(): HTMLElement {
        const root = document.querySelector("#game-over") as HTMLElement;
        this.replay = root.querySelector(".play-again");
        this.level = root.querySelector(".level");
        this.score = root.querySelector(".score");
        this.replay.addEventListener("click", () => this.actor.emit("play-again"));
        this.listen("stats", PlayerStats);
        return root;
    }

    /** @inheritDoc */
    protected render() {
        const {stats} = this;
        console.log(this.score);
        this.level.innerText = `#${stats.level + 1}`;
        this.score.innerText = `${stats.score}`;
    }
}
