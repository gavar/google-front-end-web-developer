import {Resources, Sprite} from "$components";
import {Actor, Component} from "$engine";

/**
 * View controls image of a {@link Sprite}.
 */
export class View implements Component {

    private sprite: Sprite;

    /** Resource loader to use. */
    public resources: Resources;

    /** @inheritDoc */
    public readonly actor: Actor;

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
    awake() {
        this.sprite = this.actor.add(Sprite);
    }

    /** @inheritDoc */
    destroy() {
        this.actor.remove(this.sprite);
        this.sprite = null;
    }

    private onImageLoaded(error: Error, image: HTMLImageElement) {
        this.sprite.image = image;
    }
}
