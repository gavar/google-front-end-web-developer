import React, {PureComponent} from "react";
import {Place} from "../../service";
import {$PlacesStore, PlaceState} from "../../store";
import {NearbyPlaceSummary} from "./nearby-place-summary";
import "./nearby-places-list.scss";

export interface NearbyPlacesListProps {
    onClick?(place: Place);
    onMouseOver?(place: Place);
    onMouseOut?(place: Place);
}

interface NearbyPlacesListState {
    places: Place[];
    search: string;
}

function storeToState(state: PlaceState): NearbyPlacesListState {
    const {searchPlaces, search} = state;
    return {search, places: searchPlaces};
}

export class NearbyPlacesList extends PureComponent<NearbyPlacesListProps, NearbyPlacesListState> {

    readonly store = $PlacesStore;

    constructor(props, context) {
        super(props, context);
        this.state = storeToState(this.store.state);
    }

    /** @inheritDoc */
    componentDidMount(): void {
        this.store.on(this.onPlaceStoreChanged, this);
    }

    /** @inheritDoc */
    componentWillUnmount(): void {
        this.store.off(this.onPlaceStoreChanged, this);
    }

    onPlaceStoreChanged(state: PlaceState) {
        this.setState(storeToState(state));
    }

    /** @inheritDoc */
    render() {
        const {places, search} = this.state;
        const size = places && places.length;

        let content;
        if (size) {
            const items = places.map(NearbyPlaceItem, this);
            content = <ul className="nearby-places-list" role="tablist">
                {items}
            </ul>;
        }
        else if (search) {
            content = <div className="nearby-places-empty">
                <p className="subtitle-1 text-primary">No places found matching search criteria</p>
                <p className="subtitle-2 text-secondary">To see more results, try changing search criteria.</p>
            </div>;
        }
        else {
            content = <div className="nearby-places-empty">
                <p className="subtitle-1 text-primary">No places found in the area</p>
                <p className="subtitle-2 text-secondary">To see more results, try panning or zooming the map.</p>
            </div>;
        }

        return <div className="nearby-places">
            {content}
        </div>;
    }
}

function NearbyPlaceItem(this: NearbyPlacesList, place: Place) {
    const {key} = place;
    const {onClick, onMouseOver, onMouseOut} = this.props;
    return <li key={key} className="nearby-places-list-item">
        <NearbyPlaceSummary place={place}
                            onClick={onClick}
                            onMouseOver={onMouseOver}
                            onMouseOut={onMouseOut}/>
    </li>;
}
