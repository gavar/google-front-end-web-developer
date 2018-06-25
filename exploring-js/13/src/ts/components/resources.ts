import {Bag, Component} from "$/engine";
import {Dictionary, Nodify} from "@syntax";

interface Listener {
    name: string;
    func: Nodify<HTMLImageElement>;
    target: any;
}

/** Component which loads resources. */
export class Resources implements Component, EventListenerObject {

    private listeners: Listener[];
    private images: Dictionary<string, HTMLImageElement>;
    private cache: Dictionary<string, [Error, HTMLImageElement]>;

    /**
     * Base url of resource requests.
     * @default "assets"
     */
    public baseUrl: string;

    /** @inheritDoc */
    awake() {
        this.cache = {};
        this.images = {};
        this.listeners = [];
    }

    /**
     * Load a resource by a given name.
     * @param name - name of the resource to load.
     * @param callback - callback to invoke when loading completes.
     * @param target - target to pass as this to the callback.
     * @return promise with given resource.
     */
    load(name: string, callback?: Nodify<HTMLImageElement>, target?: any): HTMLImageElement {

        // invoke callback or schedule
        if (callback) {
            if (this.cache.hasOwnProperty(name)) callback.apply(target, this.cache[name]);
            else this.listeners.push({name, func: callback, target});
        }

        // check image cache
        let image = this.images[name];
        if (image) return image;

        // create image
        this.images[name] = image = new Image();
        image.name = name;
        image.addEventListener("load", this);
        image.addEventListener("error", this);

        // start loading
        image.src = `${this.baseUrl}/${name}`;
        return image;
    }

    /** @inheritDoc */
    handleEvent(evt: Event & ErrorEvent): void {
        const image = evt.currentTarget as HTMLImageElement;
        image.removeEventListener("load", this);
        image.removeEventListener("error", this);

        // save result
        const name = image.name;
        switch (evt.type) {
            case "load":
                this.cache[name] = [void 0, image];
                break;
            case "error":
                this.cache[name] = [evt.error, void 0];
                break;
        }

        // callbacks
        for (let i = 0; i < this.listeners.length; i++) {
            // find matching listener
            const listener = this.listeners[i];
            if (listener.name !== name)
                continue;

            if (Bag.removeAt(this.listeners, i))
                i--;

            // invoke
            listener.func.apply(listener.target, this.cache[name]);
        }
    }
}

// 'Resources' defaults
Resources.prototype.baseUrl = "assets";
