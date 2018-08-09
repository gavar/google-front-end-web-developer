import React, {PureComponent} from "react";
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";
import {Place} from "../../service";
import {PlaceMarker} from "./place-marker";

export interface PlaceMarkerCloudProps {
    places: Place[];
    onClick?(place: Place);
    onMouseOver?(place: Place);
    onMouseOut?(place: Place);
}

interface PlaceMarkerCloudState {

}

export class PlaceMarkerCluster extends PureComponent<PlaceMarkerCloudProps, PlaceMarkerCloudState> {

    /** @inheritDoc */
    render() {
        const {places} = this.props;
        return <MarkerClusterer defaultMaxZoom={12}
                                defaultZoomOnClick={false}>
            {places.map(this.placeToMarker, this)}
        </MarkerClusterer>;
    }

    protected placeToMarker(place: Place) {
        const {key} = place;
        const {onClick, onMouseOver, onMouseOut} = this.props;
        return <PlaceMarker key={key}
                            place={place}
                            onClick={onClick}
                            onMouseOver={onMouseOver}
                            onMouseOut={onMouseOut}/>;
    }
}
