import {autobind} from "core-decorators";
import React, {PureComponent} from "react";
import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";
import {Place} from "../../service";
import {PlaceMarker} from "./place-marker";
import {PlaceMarkerInfo} from "./place-marker-info";

export interface PlaceMarkerCloudProps {
    places: Place[];
    hover?: Place;
    active?: Place;
    onActiveChange?(marker: Place);
    onHoverChange?(marker: Place);
}

interface PlaceMarkerCloudState {

}

export class PlaceMarkerCluster extends PureComponent<PlaceMarkerCloudProps, PlaceMarkerCloudState> {

    /** @inheritDoc */
    render() {
        const {places, active} = this.props;
        const infoWindow = active &&
            <PlaceMarkerInfo place={active}
                             onCloseClick={this.onCloseInfoWindow}/> || null;

        return <MarkerClusterer defaultMaxZoom={12}
                                defaultZoomOnClick={false}>
            {places.map(this.placeToMarker, this)}
            {infoWindow}
        </MarkerClusterer>;
    }

    protected placeToMarker(place: Place, index: number) {
        const {hover, active} = this.props;
        return <PlaceMarker key={index}
                            place={place}
                            hover={place === hover}
                            active={place === active}
                            onSelect={this.onSelect}
                            onMouseOver={this.onMouseOver}
                            onMouseOut={this.onMouseOut}/>;
    }

    @autobind
    protected onSelect(place: Place) {
        const {active, onActiveChange} = this.props;
        if (active === place) return;
        if (onActiveChange) onActiveChange(place);
    }

    @autobind
    protected onMouseOver(place: Place) {
        const {active, onHoverChange} = this.props;
        if (active === place) return;
        if (onHoverChange) onHoverChange(place);
    }

    @autobind
    protected onMouseOut(place: Place) {
        const {active, onHoverChange} = this.props;
        if (active !== place) return;
        if (onHoverChange) onHoverChange(null);
    }

    @autobind
    protected onCloseInfoWindow(place: Place) {
        const {active, onActiveChange} = this.props;
        if (active !== place) return;
        if (onActiveChange) onActiveChange(null);
    }
}
