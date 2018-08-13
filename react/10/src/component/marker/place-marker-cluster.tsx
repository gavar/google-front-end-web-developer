import React, {PureComponent} from "react";
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";
import {Place} from "../../service";
import {$PlacesStore, PlaceState} from "../../store";
import {PlaceMarker} from "./place-marker";

export interface PlaceMarkerCloudProps {
    onClick?(place: Place);
    onMouseOver?(place: Place);
    onMouseOut?(place: Place);
}

interface PlaceMarkerCloudState {
    places: Place[];
}

function storeToState(state: PlaceState): PlaceMarkerCloudState {
    const {searchPlaces} = state;
    return {places: searchPlaces};
}

export class PlaceMarkerCluster extends PureComponent<PlaceMarkerCloudProps, PlaceMarkerCloudState> {

    protected readonly store = $PlacesStore;

    constructor(props, context) {
        super(props, context);
        this.state = storeToState(this.store.state);
    }

    /** @inheritDoc */
    componentDidMount(): void {
        this.store.on(this.onStoreChanged, this);
    }

    /** @inheritDoc */
    componentWillUnmount(): void {
        this.store.off(this.onStoreChanged, this);
    }

    onStoreChanged(state: PlaceState) {
        this.setState(storeToState(state));
    }

    /** @inheritDoc */
    render() {
        const {places} = this.state;
        return <MarkerClusterer maxZoom={14}
                                zoomOnClick={false}
                                enableRetinaIcons
                                gridSize={60}>
            {places && places.map(PlaceMarkerView, this) || null}
        </MarkerClusterer>;
    }

}

function PlaceMarkerView(this: PlaceMarkerCluster, place: Place) {
    const {key} = place;
    const {onClick, onMouseOver, onMouseOut} = this.props;
    return <PlaceMarker key={key}
                        place={place}
                        onClick={onClick}
                        onMouseOver={onMouseOver}
                        onMouseOut={onMouseOut}/>;
}
