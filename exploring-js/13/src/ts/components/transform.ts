import {Vector3} from "./vector";

/**
 * Defines transformation matrix of an actor.
 */
export class Transform {
    /** World position of an actor. */
    public position: Vector3 = {x: 0, y: 0, z: 0};

    /** World scale of an actor. */
    public scale: Vector3 = {x: 1, y: 1, z: 1};

    /** Set value of {@link scale}. */
    setScale(x: number, y: number, z?: number) {
        this.scale.x = x;
        this.scale.y = y;
        if (arguments.length > 2)
            this.scale.z = z;
    }
}
