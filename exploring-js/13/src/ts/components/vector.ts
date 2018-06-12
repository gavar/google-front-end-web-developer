import {Mathf} from "$game";

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
     */
    export function smooth(now: Vector2, to: Readonly<Vector2>, velocity: Vector2, smoothTime: number, deltaTime: number): void {
        now.x = Mathf.smooth(now.x, to.x, velocity, "x", smoothTime, deltaTime);
        now.y = Mathf.smooth(now.y, to.y, velocity, "y", smoothTime, deltaTime);
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
