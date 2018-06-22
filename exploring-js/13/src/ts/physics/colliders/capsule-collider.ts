import {Vector2} from "$/components";
import {Actor} from "$/engine";
import {Gizmo2D} from "$/systems";
import {Physics2D} from "../";
import {Collider2D} from "./collider";

/**
 * Primitive collider of a capsule form.
 * Capsules are boxes with a semi-circle at each end.
 */
export class CapsuleCollider2D extends Collider2D implements Gizmo2D {

    private r: number;
    private min: Vector2 = {x: 0, y: 0};
    private max: Vector2 = {x: 0, y: 0};

    /** @inheritDoc */
    public readonly actor: Actor;

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
    drawGizmo2D(ctx: CanvasRenderingContext2D): void {
        const {position} = this.body.transform;
        const {size, offset, pivot} = this;
        const x = position.x + offset.x + pivot.x * size.x;
        const y = position.y + offset.y + pivot.y * size.y;

        ctx.strokeStyle = "red";
        Gizmo2D.x(ctx, x, y, 10);
        ctx.strokeStyle = "green";
        Gizmo2D.capsule(ctx, x, y, size.x, size.y);
    }

    /** @inheritDoc */
    recalculate(): void {
        const {position} = this.body.transform;
        const {size, offset, pivot} = this;

        const d = Math.min(size.x, size.y);
        const dx = (size.x - d) * .5;
        const dy = (size.y - d) * .5;

        this.r = d * .5;
        this.min.x = this.max.x = position.x + offset.x + pivot.x * size.x;
        this.min.y = this.max.y = position.y + offset.y + pivot.y * size.y;

        this.min.x -= dx;
        this.min.y -= dy;
        this.max.x += dx;
        this.max.y += dy;
    }

    /** @inheritDoc */
    intersect(collider: Collider2D): boolean {
        return collider.intersectCapsule(this);
    }

    /** @inheritDoc */
    intersectCapsule(capsule: CapsuleCollider2D): boolean {
        return Physics2D.intersectCapsuleCapsule(
            this.min.x, this.min.y, this.max.x, this.max.y, this.r,
            capsule.min.x, capsule.min.y, capsule.max.x, capsule.max.y, capsule.r,
        );
    }
}
