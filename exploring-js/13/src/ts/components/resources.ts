import {Component} from "$engine";
import {Callback, Dictionary} from "@syntax";

interface Listener {
    name: string;
    callback: Callback<HTMLImageElement>;
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
     * @return promise with given resource.
     */
    load(name: string, callback?: Callback<HTMLImageElement>, target?: any): HTMLImageElement {

        if (callback) {
            // invoke callback or schedule
            let result = this.cache[name];
            if (result) callback.apply(target, result);
            else this.listeners.push({name, callback, target});
        }

        // check image cache
        let image = this.images[name];
        if (image) return image;

        // create image
        this.images[name] = image = new Image();
        image.name = name;
        image.onerror;
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
            if (listener.name !== image.name)
                continue;

            // fill slot with last entry
            const last = this.listeners.pop();
            if (i < this.listeners.length)
                this.listeners[i--] = last;

            // invoke
            listener.callback.apply(listener.target, this.cache[name]);
        }
    }
}

// 'Resources' defaults
Resources.prototype.baseUrl = "assets";
