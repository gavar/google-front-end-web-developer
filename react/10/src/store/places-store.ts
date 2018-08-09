import {MemoryStore} from "$store";
import {Place} from "../service";

export interface PlaceState {
    places: Place[];
    searchPlaces: Place[];
    search: string;
}

export class PlacesStore extends MemoryStore<PlaceState> {

}

export const $PlacesStore = new PlacesStore();
