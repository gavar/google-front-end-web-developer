import {Component, System} from "$engine";

export interface LateUpdate extends Component {
    lateUpdate(deltaTime: number): void;
}

/**
 * System which invokes 'update' on a component.
 */
export class LateUpdateSystem extends System<LateUpdate> {

    /** @inheritDoc */
    match(component: LateUpdate): component is LateUpdate {
        return component.lateUpdate as any;
    }

    /** @inheritDoc */
    protected process(deltaTime: number, components: ReadonlyArray<LateUpdate>): void {
        for (const component of components)
            if (component.actor.active)
                component.lateUpdate(deltaTime);
    }
}
