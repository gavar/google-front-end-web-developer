/**
 * 2D dimensional vector with X,Y coordinates.
 */
export interface Vector2 {
    x: number;
    y: number;

}

export namespace Vector2 {
    export const zero: Readonly<Vector2> = {x: 0, y: 0};
    export const up: Readonly<Vector2> = {x: 0, y: 1};
    export const down: Readonly<Vector2> = {x: 0, y: -1};
    export const left: Readonly<Vector2> = {x: -1, y: 0};
    export const right: Readonly<Vector2> = {x: 1, y: 0};
}

/**
 * 3D dimensional vector with X,Y,Z coordinates.
 */
export interface Vector3 {
    x: number;
    y: number;
    z: number;
}
