import {Resources, Sprite} from "$components";
import {Actor, Component} from "$engine";
import {Mutable} from "@syntax";

/**
 * View controls image of a {@link Sprite}.
 */
export class View implements Component {

    /** Resource loader to use. */
    public resources: Resources;

    /** @inheritDoc */
    public readonly actor: Actor;

    /** Sprite rendering image of this view. */
    public readonly sprite: Sprite;

    /**
     * Set image to display.
     * @param name - name of the image to display.
     */
    setImage(name: string) {
        if (name) {
            this.resources = this.resources || this.actor.stage.findComponentOfType(Resources);
            this.resources.load(name, this.onImageLoaded, this);
        }
        else {
            this.sprite.image = null;
        }
    }

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.sprite = this.actor.add(Sprite);
    }

    /** @inheritDoc */
    destroy(this: Mutable<this>) {
        this.actor.remove(this.sprite);
        this.sprite = null;
    }

    private onImageLoaded(error: Error, image: HTMLImageElement) {
        this.sprite.image = image;
    }
}
