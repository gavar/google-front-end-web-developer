/**
 * 2D dimensional vector with X,Y coordinates.
 */
export interface Vector2 {
    x: number;
    y: number;
}

export namespace Vector2 {

    export const zero: Readonly<Vector2> = {x: 0, y: 0};
    export const one: Readonly<Vector2> = {x: 1, y: 1};
    export const up: Readonly<Vector2> = {x: 0, y: 1};
    export const down: Readonly<Vector2> = {x: 0, y: -1};
    export const left: Readonly<Vector2> = {x: -1, y: 0};
    export const right: Readonly<Vector2> = {x: 1, y: 0};

    /**
     * Gradually change towards a destination value over time.
     * @param now - current value (modified by this function).
     * @param to - destination value to achieve.
     * @param velocity - object to store velocity.
     * @param smoothTime - approx time of achieving destination value.
     * @param deltaTime - time since last call of this function.
     * @param velocityLimit - maximum velocity.
     * @see https://github.com/Unity-Technologies/UnityCsReference/blob/11bcfd801fccd2a52b09bb6fd636c1ddcc9f1705/Runtime/Export/Vector2.cs#L201
     */
    export function smooth(now: Vector2, to: Readonly<Vector2>, velocity: Vector2, smoothTime: number, deltaTime: number, velocityLimit: number = Number.POSITIVE_INFINITY): void {
        const o = 2 / smoothTime;
        const x = o * deltaTime;
        const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

        let dx = now.x - to.x;
        let dy = now.y - to.y;

        // clamp
        const max = velocityLimit * smoothTime;
        const sqr = dx * dx + dy * dy;
        if (sqr > max * max) {
            const length = Math.sqrt(sqr);
            dx = dx / length * max;
            dy = dy / length * max;
        }
        let tx = now.x - dx;
        let ty = now.y - dy;

        let t;
        t = (velocity.x + o * dx) * deltaTime;
        velocity.x = (velocity.x - o * t) * e;
        let rx = tx + (dx + t) * e;

        t = (velocity.y + o * dy) * deltaTime;
        velocity.y = (velocity.y - o * t) * e;
        let ry = ty + (dy + t) * e;

        // prevent overshooting
        const dx1 = to.x - now.x;
        const dy1 = to.y - now.y;
        const dx2 = rx - to.x;
        const dy2 = ry - to.y;
        const dot = dx1 * dx2 + dy1 * dy2;
        if (dot > 0) {
            rx = to.x;
            ry = to.y;
            velocity.x = (rx - to.x) / deltaTime;
            velocity.y = (ry - to.y) / deltaTime;
        }

        // apply
        now.x = rx;
        now.y = ry;
    }

    /** Calculate length of a vector - square root of (x * x + y * y). */
    export function magnitude(vector: Vector2): number {
        const {x, y} = vector;
        return Math.sqrt(x * x + y * y);
    }

    /**
     * Limit vector's magnitude to a given value.
     * @param vector - vector to clamp.
     * @param limit - vector length limit.
     */
    export function clampMagnitude(vector: Vector2, limit: number) {
        const {x, y} = vector;
        if (x * x + y * y > limit * limit) {
            Vector2.normalize(vector);
            vector.x *= limit;
            vector.y *= limit;
        }
    }

    /**
     * Set given vector magnitude to 1.
     * @param vector - vector to normalize.
     */
    export function normalize(vector: Vector2) {
        const {x, y} = vector;
        const length = Math.sqrt(x * x + y * y);
        vector.x /= length;
        vector.y /= length;
    }

    /**
     * Calculate unsigned angle between two vectors in degrees.
     * Smaller of the two possible angles between the two vectors is used.
     */
    export function angle(a: Readonly<Vector2>, b: Readonly<Vector2>): number {
        const f1 = Math.sqrt(a.x * a.x + a.y * a.y); // length of A
        const f2 = Math.sqrt(b.x * b.x + b.y * b.y); // length of B
        const dot = (a.x / f1) * (b.x / f2) + (a.y / f1) * (b.y / f2);
        return Math.acos(dot) / Math.PI * 180;
    }
}

/**
 * 3D dimensional vector with X,Y,Z coordinates.
 */
export interface Vector3 {
    x: number;
    y: number;
    z: number;
}
