import {Layer, Resources, Sprite, Terrain2D, Transform, Vector2} from "$/components";
import {Actor, Component} from "$/engine";
import {Ghost, Player, View} from "$/game";
import {Gizmo2D, LateUpdate} from "$/systems";

/**
 * Scene containing main menu cinematic.
 */
export class CinematicScene implements Component {

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Scene actors. */
    private readonly actors: Actor[] = [];

    /** Resource loader. */
    public loader: Resources;

    public terrain: Terrain2D;
    public player: Player;

    private initialized: boolean;
    private readonly look: Vector2 = {x: 0, y: 0};

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

    private initPlayer() {
        const ghost = this.player.actor.require(Ghost);
        ghost.duration = Number.POSITIVE_INFINITY;
        ghost.blink = false;
        Component.enable(ghost);

        const {player, terrain, look} = this;
        look.x = terrain.positionX(2.5);
        look.y = terrain.positionY(1.0);
        player.applyPosition(
            terrain.positionX(2.0),
            terrain.positionY(0),
        );
    }

    /** Spawn scene actors. */
    private initialize() {
        const {terrain, look} = this;

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

    private activate(active: boolean) {
        for (const actor of this.actors)
            actor.setActive(active);
    }

    private enemy(x: number, y: number, look: Vector2, r: number): Actor {
        const actor = this.actor.stage.createActor("cinematic-enemy");

        // bring to front
        const layer = actor.require(Layer);
        layer.set(1000);

        // configure image
        const view = actor.require(View);
        view.setImage("enemy-bug.png");

        // tiny bugs are cool
        const transform = actor.require(Transform);
        const {rotation, scale} = transform;
        scale.x = 0.75;
        scale.y = 0.75;

        const motor = actor.require(CinematicMotor);
        const {position, direction} = motor;
        position.x = x;
        position.y = y;

        // use constants since image is not yet loaded
        const size: Vector2 = {
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
        if (direction.x < 0) scale.y *= -1;

        // save actor ref
        this.actors.push(actor);
        return actor;
    }
}

/**
 * Actor animation motor for {@link CinematicScene}.
 */
class CinematicMotor implements Component, LateUpdate, Gizmo2D {

    private time: number = 0;

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** @inheritDoc */
    public gizmo: boolean;

    /** Sine phase offset to avoid synchronous movement */
    public offset: number;

    /** Frequency of single back and forth movement. */
    public freq: number = 0.75;

    /** Actor's transform. */
    public transform: Transform;

    /** Starting position of the actor. */
    public position: Vector2 = {x: 0, y: 0};

    /** Actor movement direction and amplitude. */
    public direction: Vector2 = {x: 0, y: 0};

    /** @inheritDoc */
    awake() {
        this.offset = Math.random() * Math.PI;
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    lateUpdate(deltaTime: number): void {
        deltaTime *= 1 + Math.random() * .5;
        this.time += deltaTime;

        const {freq, position, direction, transform} = this;
        const t = ((this.time + this.offset) * freq) % Math.PI;
        const f = 1 + Math.sin(Math.PI + t);

        transform.position.x = position.x + direction.x * f;
        transform.position.y = position.y + direction.y * f;
    }

    /** @inheritDoc */
    drawGizmo2D(ctx: CanvasRenderingContext2D): void {
        const sprite = this.actor.get(Sprite);
        if (sprite.image) {
            const {direction} = this;
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
