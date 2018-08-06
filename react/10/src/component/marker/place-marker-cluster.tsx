import {PlaceResult} from "$google/maps/places";
import {autobind} from "core-decorators";
import React, {PureComponent} from "react";
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";
import {PlaceMarker} from "./place-marker";

export interface PlaceMarkerCloudProps {
    places: PlaceResult[];
}

export interface PlaceMarkerCloudState {
    selection?: string;
}

export class PlaceMarkerCluster extends PureComponent<PlaceMarkerCloudProps, PlaceMarkerCloudState> {

    /** @inheritDoc */
    state = {} as PlaceMarkerCloudState;

    /** @inheritDoc */
    render() {
        const {places} = this.props;
        return <MarkerClusterer>
            {places.map(this.placeToMarker, this)}
        </MarkerClusterer>;
    }

    protected placeToMarker(place: PlaceResult) {
        const key = place.place_id;
        const {selection} = this.state;
        return <PlaceMarker key={key}
                            place={place}
                            active={key === selection}
                            onSelect={this.onSelect}
                            onDestroy={this.onDestroy}/>;
    }

    @autobind
    protected onSelect(marker: PlaceMarker) {
        const key = marker.props.place.place_id;
        this.setState({selection: key});
    }

    @autobind
    protected onDestroy(marker: PlaceMarker) {
        const {selection} = this.state;
        const key = marker.props.place.place_id;
        if (selection !== key) return;
        this.setState({selection: null});
    }
}
