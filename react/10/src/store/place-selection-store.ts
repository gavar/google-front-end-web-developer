import {MemoryStore} from "$store";
import {Place} from "../service";

export interface PlaceSelectionState {
    hover: Place;
    selection: Place;
}

export class PlaceSelectionStore extends MemoryStore<PlaceSelectionState> {

}

export const $PlaceSelectionStore = new PlaceSelectionStore();
