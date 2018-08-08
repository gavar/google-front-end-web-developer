import Dexie from "dexie";
import {Place} from "./place";

/**
 * Storage for application data that use IndexedDB or WebSQL.
 */
export class SqlStore extends Dexie {

    places: Dexie.Table<Place, string>;

    constructor() {
        super("app");
    }

    async init() {
        this.version(1).stores({places: "key, updateTime"});
        this.places = this.table("places");
        await this.open();
    }
}

// default store instance
export const store = new SqlStore();
store.init();
