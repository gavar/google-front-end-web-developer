import React, {Component, ComponentType, ReactType} from "react";
import ReactPose from "react-pose";
import {ComponentFactory, DomPopmotionConfig, PoseElementProps} from "./react-pose-types";
import {PoseBehaviour, PoseController, PoseStatus} from "./types";
import HTML = JSX.IntrinsicElements;

/** Represents type signature of the {@link PoseAnimator} class. */
export interface PoseTransitionType<C extends ComponentType | keyof HTML = "div"> {
    new(props: PoseAnimatorProps<C>, context?: any): PoseAnimator<C>;
    defaultProps?: Partial<PoseAnimatorProps<C>>;
    displayName?: string;
}

/** Properties of the {@link PoseAnimator}. */
export interface PoseAnimatorProps<C extends ComponentType | keyof HTML = "div"> extends PoseBehaviour {
    /** State of the controller to move in. */
    pose: string;

    initialPose?: string;

    /** Controller providing configuration of available states. */
    controller: PoseController;

    /**
     * Type of the react component to render.
     * @default "div"
     */
    type?: C;

    /** Attributes to pass into a react element {@link type}. */
    attr?: ComponentProps<C>;
}

interface PoseToggleState {
    poser: ComponentType<PoseElementProps>;
}

export class PoseAnimator<C extends ComponentType | keyof HTML = "div"> extends Component<PoseAnimatorProps, PoseToggleState> {

    /**
     * Last pose that has been successfully completed tradition.
     * Excluded from state since it should trigger component update.
     */
    lastPose?: string;

    constructor(props: PoseAnimatorProps<C>, context: any) {
        super(props as PoseAnimatorProps, context);
        const poser = createPoser(props as PoseAnimatorProps);
        this.state = {poser};
        this.onPoseComplete = this.onPoseComplete.bind(this);
    }

    /** @inheritDoc */
    componentWillReceiveProps(next: Readonly<PoseAnimatorProps>, context: any): void {
        // check if poser configuration changed
        if (isPoserConfigChanged(this.props, next)) {
            const poser = createPoser(next);
            this.setState({poser});
        }
    }

    /** @inheritDoc */
    componentDidUpdate(prevProps: Readonly<PoseAnimatorProps>): void {
        const next = this.props.pose;
        const prev = prevProps.pose;
        if (prev !== next) {
            if (prev) this.notifyTransition(prev, PoseStatus.exiting);
            if (next) this.notifyTransition(next, PoseStatus.entering);
        }
    }

    /** @inheritDoc */
    render() {
        const {poser: Poser} = this.state;
        const {pose, initialPose, attr, children} = this.props;
        return <Poser {...attr}
                      pose={pose}
                      initialPose={initialPose}
                      onPoseComplete={this.onPoseComplete}>
            {children}
        </Poser>;
    }

    onPoseComplete() {
        const {pose} = this.props;
        if (this.lastPose === pose) return;

        if (this.lastPose) this.notifyTransition(this.lastPose, PoseStatus.exited);
        if (pose) this.notifyTransition(pose, PoseStatus.entered);
        this.lastPose = pose;
    }

    private notifyTransition(state: string, status: PoseStatus) {
        const {controller, onStateTransition} = this.props;
        if (onStateTransition) onStateTransition(state, status, controller);
    }
}

function factoryOf<P>(type: ReactType<P>): ComponentFactory {
    switch (typeof type) {
        case "function":
            return ReactPose(type as any);
        default:
            return ReactPose[type as string];
    }
}

function createPoser(props: PoseAnimatorProps): ComponentType<PoseElementProps> {
    const {type, controller} = props;
    const {poses, ...other} = controller;

    const config: DomPopmotionConfig = {
        ...poses,
        ...other,
    };

    const factory = factoryOf(type || "div");
    if (factory) return factory(config);

    console.error(`unable to resolve factory for element of type: '${type}'`);
    return ReactPose.div(config);
}

function isPoserConfigChanged(prev: PoseAnimatorProps, next: PoseAnimatorProps): boolean {
    if (prev.type !== next.type) return true;
    if (!equalControllers(prev.controller, next.controller)) return true;
    return false;
}

function equalControllers(a: PoseController, b: PoseController): boolean {
    if (a !== b) return false;
    if (a.props !== b.props) return false;
    if (!equalObjects(a.poses, b.poses)) return false;
    return true;
}

function equalObjects(a: object, b: object): boolean {
    if (a !== b)
        return false;

    for (const key in b)
        if (b[key] !== a[key])
            return false;

    return true;
}

// properties of the component being animated
type ComponentProps<C>
    = C extends keyof HTML ? HTML[C]
    : C extends ComponentType<infer P> ? P
    : HTML["div"]
    ;
