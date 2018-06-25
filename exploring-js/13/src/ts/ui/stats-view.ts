import {Canvas, Terrain2D} from "$/components";
import {GameSettings, PlayerStats} from "$/game";
import {DialogView} from "$/ui";

/**
 * Renders player stats, like scores and lives.
 */
export class StatsView extends DialogView {

    private static readonly buffer = [];

    private score: HTMLElement;
    private lives: HTMLElement;
    private level: HTMLElement;

    public stats: PlayerStats;
    public settings: GameSettings;
    public canvas: Canvas;
    public terrain: Terrain2D;

    /** @inheritDoc */
    protected initialize(): HTMLElement {
        this.canvas = this.canvas || this.actor.stage.findComponentOfType(Canvas);
        this.terrain = this.terrain || this.actor.stage.findComponentOfType(Terrain2D);
        this.settings = this.settings || this.actor.stage.findComponentOfType(GameSettings);
        const root = document.querySelector<HTMLElement>("#player-stats");
        this.score = root.querySelector(".score");
        this.lives = root.querySelector(".lives");
        this.level = root.querySelector(".level");
        this.listen("stats", PlayerStats);
        return root;
    }

    /** @inheritDoc */
    protected render(): void {
        const {stats, settings} = this;
        this.setInnerText(this.score, stats.score);
        this.setInnerText(this.level, stats.level + 1);
        this.setInnerText(this.lives, StatsView.livesToHearts(stats.lives, settings.lives));
    }

    protected static livesToHearts(now: number, init: number): string {
        const {buffer} = StatsView;
        try {
            for (let i = 0; i < now; i++)
                buffer.push("❤️"); // ❤ Red Heart
            while (buffer.length < init)
                buffer.unshift("🖤"); // 🖤 Black Heart
            return buffer.join("");
        }
        finally {
            buffer.length = 0;
        }
    }

    private setInnerText(element: HTMLElement, value: string | number) {
        const prev = element.innerText;
        if (prev == value) return;
        element.innerText = value as any;
        this.playGfx(element, "change");
    }

    private playGfx(element: HTMLElement, gfx: string) {
        element.classList.remove(gfx);
        element.style.animation = "none";
        element.offsetHeight; // reflow
        element.style.animation = null;
        element.classList.add(gfx);
    }
}
