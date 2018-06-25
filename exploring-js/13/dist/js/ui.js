/**
 * Base class for views which updates UI whenever some component has been modified.
 */
class BaseView {
    constructor() {
        this.dirty = true;
    }
    /** @inheritDoc */
    enable() {
        this.dirty = true;
    }
    /** Mark view as dirty to repaint in next frame. */
    setDirty() {
        this.dirty = true;
    }
    /** @inheritDoc */
    draw2D() {
        if (this.dirty) {
            this.dirty = false;
            this.render();
        }
    }
    /**
     * Listen for changes on the component.
     * Whenever the {@link GameEvents.PROPERTY_CHANGED} event occurs on a provided component,
     * this view will be automatically re-rendered.
     *
     * @param key - property on this instance storing component.
     * @param type - type of the component to find if not yet configured.
     * @return component of the given type.
     */
    listen(key, type) {
        const component = this[key] || this.actor.stage.findComponentOfType(type);
        component.actor.on(GameEvents.PROPERTY_CHANGED, this.setDirty, this);
        this[key] = component;
        return component;
    }
}

/** Base class for in-game dialogs.*/
class DialogView extends BaseView {
    /** @inheritDoc */
    enable() {
        super.enable();
        if (this.initialized) {
            this.overlay.show(this);
            this.activate(true);
            this.render();
        }
    }
    /** @inheritDoc */
    start() {
        this.initialized = true;
        this.root = this.initialize();
        this.overlay = this.overlay || this.actor.stage.findComponentOfType(OverlayView);
        this.activate(this.active);
    }
    /** @inheritDoc */
    disable() {
        this.overlay.hide(this);
        this.activate(false);
    }
    /**
     * Set this dialog to be shown or hidden.
     * @param active - whether to show dialog; hide otherwise.
     */
    activate(active) {
        // update attributes
        DialogView.setStateAttributes(active, this.root);
        // enable / disable component
        if (active)
            Component.enable(this);
        else
            Component.disable(this);
        // update state
        this.active = active;
        if (active)
            this.setDirty();
    }
    static setStateAttributes(value, element) {
        if (element) {
            if (value) {
                element.setAttribute("ready", "");
                element.setAttribute("open", "");
                element.removeAttribute("hide");
            }
            else if (element.hasAttribute("ready")) {
                element.setAttribute("hide", "");
                element.removeAttribute("open");
            }
        }
    }
}

class OverlayView {
    constructor() {
        /** Set of active dialogs. */
        this.dialogs = new Set();
    }
    /** @inheritDoc */
    awake() {
        this.main = document.querySelector("main");
        this.root = document.querySelector(".overlay");
    }
    /** Notify that dialog has been shown. */
    show(dialog) {
        if (this.dialogs.add(dialog)) {
            dialog.activate(true);
            this.modified();
        }
    }
    /** Notify that dialog has been hidden. */
    hide(dialog) {
        if (this.dialogs.delete(dialog)) {
            dialog.activate(false);
            this.modified();
        }
    }
    /** Hide all dialogs. */
    close() {
        for (const dialog of this.dialogs)
            this.hide(dialog);
    }
    /**
     * Set this overlay to be shown or hidden.
     * @param active - whether to show dialog; hide otherwise.
     */
    activate(active) {
        const { root, main } = this;
        DialogView.setStateAttributes(active, root);
        DialogView.setStateAttributes(active, main);
    }
    modified() {
        this.activate(this.dialogs.size > 0);
    }
}

/**
 * Renders player stats, like scores and lives.
 */
class StatsView extends DialogView {
    /** @inheritDoc */
    initialize() {
        this.canvas = this.canvas || this.actor.stage.findComponentOfType(Canvas);
        this.terrain = this.terrain || this.actor.stage.findComponentOfType(Terrain2D);
        this.settings = this.settings || this.actor.stage.findComponentOfType(GameSettings);
        const root = document.querySelector("#player-stats");
        this.score = root.querySelector(".score");
        this.lives = root.querySelector(".lives");
        this.level = root.querySelector(".level");
        this.listen("stats", PlayerStats);
        return root;
    }
    /** @inheritDoc */
    render() {
        const { stats, settings } = this;
        this.setInnerText(this.score, stats.score);
        this.setInnerText(this.level, stats.level + 1);
        this.setInnerText(this.lives, StatsView.livesToHearts(stats.lives, settings.lives));
    }
    static livesToHearts(now, init) {
        const { buffer } = StatsView;
        try {
            if (now > init)
                return `${now} x ❤️`; // 'N' x ❤ Red Heart
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
    setInnerText(element, value) {
        const prev = element.innerText;
        if (prev == value)
            return;
        element.innerText = value;
        this.playGfx(element, "change");
    }
    playGfx(element, gfx) {
        element.classList.remove(gfx);
        element.style.animation = "none";
        element.offsetHeight; // reflow
        element.style.animation = null;
        element.classList.add(gfx);
    }
}
StatsView.buffer = [];

/**
 * Renders debug information about current game difficulty.
 */
class DifficultyView {
    /** @inheritDoc */
    start() {
        this.difficulty = this.difficulty || this.actor.stage.findComponentOfType(GameDifficulty);
        if (!this.root) {
            this.root = document.createElement("p");
            document.body.appendChild(this.root);
        }
    }
    /** @inheritDoc */
    lateUpdate(deltaTime) {
        const { difficulty } = this;
        this.root.innerText = `
        Level: ${difficulty.level}
        Enemy Limit: ${difficulty.enemyLimit}
        Enemy Delay: ${difficulty.enemyDelay}
        Enemy Velocity: ${difficulty.enemyVelocity}
        Bonus Chance: ${difficulty.bonusChance}
        `;
    }
}

class MainMenuDialog extends DialogView {
    /** @inheritDoc */
    initialize() {
        const root = document.querySelector("#main-menu");
        this.play = root.querySelector(".play");
        this.howto = root.querySelector(".how-to-play");
        this.play.addEventListener("click", () => this.actor.emit("play"));
        this.howto.addEventListener("click", () => this.actor.emit("how-to-play"));
        return root;
    }
    /** @inheritDoc */
    render() {
        // nothing to do here
    }
    /** @inheritDoc */
    activate(active) {
        super.activate(active);
        DialogView.setStateAttributes(active, this.root.parentElement);
    }
}

class HowToPlayDialog extends DialogView {
    /** @inheritDoc */
    initialize() {
        const root = document.querySelector("#how-to-play");
        this.back = root.querySelector(".back");
        this.back.addEventListener("click", () => this.actor.emit("back"));
        return root;
    }
    /** @inheritDoc */
    render() {
        // nothing to do here
    }
    /** @inheritDoc */
    activate(active) {
        super.activate(active);
        DialogView.setStateAttributes(active, this.root.parentElement);
    }
}

class GameOverDialog extends DialogView {
    /** @inheritDoc */
    initialize() {
        const root = document.querySelector("#game-over");
        this.back = root.querySelector(".back");
        this.level = root.querySelector(".level");
        this.score = root.querySelector(".score");
        this.back.addEventListener("click", () => this.actor.emit("back"));
        this.listen("stats", PlayerStats);
        return root;
    }
    /** @inheritDoc */
    render() {
        const { stats } = this;
        this.level.innerText = `#${stats.level + 1}`;
        this.score.innerText = `${stats.score}`;
    }
}

/**
 * Scene containing main menu cinematic.
 */
class CinematicScene {
    constructor() {
        /** Scene actors. */
        this.actors = [];
        this.look = { x: 0, y: 0 };
    }
    /** @inheritDoc */
    enable() {
        if (this.initialized)
            this.initPlayer();
        this.activate(true);
    }
    /** @inheritDoc */
    start() {
        this.initialized = true;
        this.player = this.player || this.actor.stage.findComponentOfType(Player);
        this.loader = this.loader || this.actor.stage.findComponentOfType(Resources);
        this.terrain = this.terrain || this.actor.stage.findComponentOfType(Terrain2D);
        this.initPlayer();
        this.initialize();
    }
    /** @inheritDoc */
    disable() {
        this.activate(false);
    }
    initPlayer() {
        const ghost = this.player.actor.require(Ghost);
        ghost.duration = Number.POSITIVE_INFINITY;
        ghost.blink = false;
        Component.enable(ghost);
        const { player, terrain, look } = this;
        look.x = terrain.positionX(2.5);
        look.y = terrain.positionY(1.0);
        player.applyPosition(terrain.positionX(2.0), terrain.positionY(0));
    }
    /** Spawn scene actors. */
    initialize() {
        const { terrain, look } = this;
        const size = 9;
        const min = Math.PI * .31;
        const max = Math.PI - min;
        const step = (max - min) / (size - 1);
        const yMin = Math.sin(min);
        for (let i = 0; i < size; i++) {
            const a = min + step * i;
            const x = Math.cos(a);
            const y = Math.sin(a) - yMin;
            const dx = 2.0 + x * 3.5 + x * (1 - Math.abs(x));
            const dy = 1.0 + y * 12;
            const px = terrain.positionX(dx);
            const py = terrain.positionY(dy);
            this.enemy(px, py, look, 0);
        }
    }
    activate(active) {
        for (const actor of this.actors)
            actor.setActive(active);
    }
    enemy(x, y, look, r) {
        const actor = this.actor.stage.createActor("cinematic-enemy");
        // bring to front
        const layer = actor.require(Layer);
        layer.set(1000);
        // configure image
        const view = actor.require(View);
        view.setImage("enemy-bug.png");
        // tiny bugs are cool
        const transform = actor.require(Transform);
        const { rotation, scale } = transform;
        scale.x = 0.75;
        scale.y = 0.75;
        const motor = actor.require(CinematicMotor);
        const { position, direction } = motor;
        position.x = x;
        position.y = y;
        // use constants since image is not yet loaded
        const size = {
            x: 101 / 2,
            y: 171 / 2,
        };
        // look at direction
        direction.x = look.x - position.x - size.x;
        direction.y = look.y - position.y - size.y;
        rotation.z = 180 + Vector2.angle(Vector2.left, direction);
        // do not reach look position
        size.x *= scale.x;
        size.y *= scale.y;
        let distance = Vector2.magnitude(direction) - r;
        distance -= Vector2.magnitude(size);
        Vector2.clampMagnitude(direction, distance);
        // simulate that bug has eye from both sides
        if (direction.x < 0)
            scale.y *= -1;
        // save actor ref
        this.actors.push(actor);
        return actor;
    }
}
/**
 * Actor animation motor for {@link CinematicScene}.
 */
class CinematicMotor {
    constructor() {
        this.time = 0;
        /** Frequency of single back and forth movement. */
        this.freq = 0.75;
        /** Starting position of the actor. */
        this.position = { x: 0, y: 0 };
        /** Actor movement direction and amplitude. */
        this.direction = { x: 0, y: 0 };
    }
    /** @inheritDoc */
    awake() {
        this.offset = Math.random() * Math.PI;
        this.transform = this.actor.require(Transform);
    }
    /** @inheritDoc */
    lateUpdate(deltaTime) {
        deltaTime *= 1 + Math.random() * .5;
        this.time += deltaTime;
        const { freq, position, direction, transform } = this;
        const t = ((this.time + this.offset) * freq) % Math.PI;
        const f = 1 + Math.sin(Math.PI + t);
        transform.position.x = position.x + direction.x * f;
        transform.position.y = position.y + direction.y * f;
    }
    /** @inheritDoc */
    drawGizmo2D(ctx) {
        const sprite = this.actor.get(Sprite);
        if (sprite.image) {
            const { direction } = this;
            const px = sprite.x(0.5);
            const py = sprite.y(0.5);
            const dx = direction.x;
            const dy = direction.y;
            ctx.strokeStyle = "green";
            Gizmo2D.x(ctx, px, py);
            ctx.moveTo(px, py);
            ctx.lineTo(px + dx, py + dy);
            ctx.stroke();
        }
    }
}
