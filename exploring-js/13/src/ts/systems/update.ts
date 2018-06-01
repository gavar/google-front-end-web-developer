import {Component, ComponentSystem} from "$engine";

export interface Update extends Component {
    update(deltaTime: number): void;
}

/**
 * System which invokes 'update' on a component.
 */
export class UpdateSystem extends ComponentSystem<Update> {

    /** @inheritDoc */
    match(component: Update): component is Update {
        return component.update as any;
    }

    /** @inheritDoc */
    protected process(deltaTime: number, components: ReadonlyArray<Update>): void {
        for (const component of components)
            if (component.actor.active)
                component.update(deltaTime);
    }
}
