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
    searchPlaces: Place[];
    search: string;
}

const LIMIT = 20;

function storeToState(state: PlaceState): NearbyPlacesListState {
    const {searchPlaces, search} = state;
    const size = searchPlaces && searchPlaces.length || 0;
    const places = size > LIMIT ? searchPlaces.slice(0, LIMIT) : searchPlaces;
    return {
        search,
        places,
        searchPlaces,
    };
}

export class NearbyPlacesList extends PureComponent<NearbyPlacesListProps, NearbyPlacesListState> {

    protected readonly store = $PlacesStore;

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
        const {places, search, searchPlaces} = this.state;
        const size = places && places.length || 0;
        const limited = searchPlaces && searchPlaces.length > size;

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
            {limited && Limitation() || null}
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

function Limitation() {
    return <div className="nearby-places-limit">
        <p className="subtitle-1 text-primary">{`Showing only first ${LIMIT} best matches.`}</p>
        <p className="subtitle-2 text-secondary">Try to zoom or set search criteria for better results.</p>
    </div>;
}
