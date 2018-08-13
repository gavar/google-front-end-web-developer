import {Action} from "popmotion";

/** State machine configuration. */
export interface PoseController<S extends string = keyof any, P = any> {

    /** Set of poses available for transition. */
    poses?: Poses<S, P>;

    /** Extra properties to pass in pose transitions. */
    props?: P;
}

export interface PoseBehaviour<S extends string = keyof any> {
    onStateTransition?(state: S, status: PoseStatus, controller);
}

/** Object literal with set of poses. */
export type Poses<S extends string = keyof any, P = any> = {

    /** Pose to apply when animator transitions to a state. */
    [P in S]: Pose<P>;
};

/** Defines actor styling in particular state. */
export interface Pose<P = any> {

    /** Duration, in milliseconds, to delay this transition. */
    delay?: number;

    /** Defines the type of animation for moving the value into a pose. */
    transition?: Transition<P>;

    // TODO: style properties
    [key: string]: any;
}

/** Defines transition to use for pose animation. */
export type Transition<P = any> =
    | "tween" | "physics" | "spring" | "decay" | "keyframes"
    | TransitionFactory<P>
    ;

export interface TransitionProps {
    key: string;
    from: string | number;
    to: string | number;
    velocity: number;
}

export interface TransitionFactory<P = any> {
    (props: TransitionProps & P): Action | false;
}

/** Status the animator state. */
export enum PoseStatus {
    exited = 1,
    exiting,
    entering,
    entered,
}

export namespace PoseStatus {

    export function begin(enter: boolean): PoseStatus {
        const {exiting, entering} = PoseStatus;
        return enter ? entering : exiting;
    }

    export function complete(enter: boolean): PoseStatus {
        const {exited, entered} = PoseStatus;
        return enter ? entered : exited;
    }
}
