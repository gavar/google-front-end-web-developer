import {Component} from "$engine";
import {Dictionary} from "@syntax";

export type Resource = HTMLImageElement;

/** Component which loads resources. */
export class Resources implements Component {

    private cache: Dictionary<string, Promise<Resource>>;

    /**
     * Base url of resource requests.
     * @default "assets"
     */
    public baseUrl: string;

    /** @inheritDoc */
    awake() {
        this.cache = {};
    }

    /**
     * Load a resource by a given name.
     * @param name - name of the resource to load.
     * @return promise with given resource.
     */
    load(name: string): Promise<Resource> {

        // check if already loading or loaded
        let promise = this.cache[name];
        if (promise) return promise;

        // start loading
        promise = new Promise<Resource>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.onerror = event => {
                console.error(event);
                reject(event);
            };

            img.src = `${this.baseUrl}/${name}`;
        });

        this.cache[name] = promise;
        return promise;
    }
}

// 'Resources' defaults
Resources.prototype.baseUrl = "assets";
