import {autobind} from "core-decorators";
import React, {PureComponent} from "react";
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";
import {Place} from "../../service";
import {PlaceMarker} from "./place-marker";

export interface PlaceMarkerCloudProps {
    places: Place[];
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

    protected placeToMarker(place: Place) {
        const {key} = place;
        const {selection} = this.state;
        return <PlaceMarker key={key}
                            place={place}
                            active={key === selection}
                            onSelect={this.onSelect}
                            onDestroy={this.onDestroy}/>;
    }

    @autobind
    protected onSelect(place: Place) {
        const {key} = place;
        this.setState({selection: key});
    }

    @autobind
    protected onDestroy(place: Place) {
        const {key} = place;
        const {selection} = this.state;
        if (selection !== key) return;
        this.setState({selection: null});
    }
}
