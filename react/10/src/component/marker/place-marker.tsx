import {Point} from "$google/maps";
import {classNames} from "$util";
import {autobind} from "core-decorators";
import React, {PureComponent} from "react";
import MarkerWithLabel from "react-google-maps/lib/components/addons/MarkerWithLabel";
import {Place} from "../../service";
import "./place-marker.scss";
import PlaceMarkerPin from "./place-marker.svg";

export interface PlaceMarkerProps {
    place: Place;
    hover?: boolean;
    active?: boolean;
    onMouseOver?(marker: Place);
    onMouseOut?(marker: Place);
    onSelect?(marker: Place);
}

interface PlaceMarkerState {

}

let AnchorPoint: Point;
const markerPin = <PlaceMarkerPin className="place-marker-pin"/>;

export class PlaceMarker extends PureComponent<PlaceMarkerProps, PlaceMarkerState> {

    constructor(props, context) {
        AnchorPoint = AnchorPoint || new google.maps.Point(16, 48);
        super(props, context);
        this.state = {hover: false};
    }

    /** @inheritDoc */
    render() {
        const {place, active} = this.props;
        const {location, key} = place;
        const hover = this.props.hover;

        const z = hover ? 1001 : active ? 1000 : void 0;
        const className = classNames(
            "place-marker",
            active ? "active" : hover && "hover",
        );

        return <MarkerWithLabel key={key}
                                zIndex={z}
                                place={{placeId: key, location: location}}
                                position={location}
                                icon={" "} // hide default marker icon
                                labelClass={className}
                                labelAnchor={AnchorPoint}
                                onMouseOver={this.onMouseOver}
                                onMouseOut={this.onMouseOut}
                                onClick={this.onClick}>
            <div className="place-marker-container">
                {markerPin}
            </div>
        </MarkerWithLabel>;
    }

    @autobind
    protected onClick() {
        const {place, onSelect} = this.props;
        if (onSelect) onSelect(place);
    }

    @autobind
    protected onMouseOver() {
        const {place, onMouseOver} = this.props;
        if (onMouseOver) onMouseOver(place);
    }

    @autobind
    protected onMouseOut() {
        const {place, onMouseOut} = this.props;
        if (onMouseOut) onMouseOut(place);
    }
}
