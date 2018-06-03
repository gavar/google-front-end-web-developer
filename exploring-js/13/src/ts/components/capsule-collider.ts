import {Transform, Vector2} from "$components";
import {Actor} from "$engine";
import {Gizmo2D} from "$systems";

/**
 * Primitive collider of a capsule form.
 * Capsules are boxes with a semi-circle at each end.
 */
export class CapsuleCollider2D implements Gizmo2D {

    private transform: Transform;

    /** @inheritDoc */
    public readonly actor: Actor;

    /** @inheritDoc */
    public gizmo?: boolean;

    /** Width and height of the capsule area. */
    public size: Vector2 = {x: 0, y: 0};

    /** Local pivot of the collider geometry. */
    public pivot: Vector2 = {x: .5, y: .5};

    /** Local offset of the collider geometry. */
    public offset: Vector2 = {x: 0, y: 0};

    /** Modify {@link size} values. */
    setSize(x: number, y: number) {
        this.size.x = x;
        this.size.y = y;
    }

    /** Modify {@link offset} values. */
    setOffset(x: number, y: number) {
        this.offset.x = x;
        this.offset.y = y;
    }

    /** Modify {@link pivot} values. */
    setPivot(x: number, y: number) {
        this.pivot.x = x;
        this.pivot.y = y;
    }

    /** @inheritDoc */
    awake() {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    drawGizmo2D(ctx: CanvasRenderingContext2D): void {
        const {position} = this.transform;
        const {size, offset, pivot} = this;
        const x = position.x + offset.x + pivot.x * size.x;
        const y = position.y + offset.y + pivot.y * size.y;

        ctx.strokeStyle = "red";
        Gizmo2D.x(ctx, x, y, 10);
        ctx.strokeStyle = "green";
        Gizmo2D.capsule(ctx, x, y, size.x, size.y);
    }
}
