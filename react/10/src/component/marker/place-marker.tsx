import {Point} from "$google/maps";
import {classNames} from "$util";
import {autobind} from "core-decorators";
import React, {PureComponent} from "react";
import MarkerWithLabel from "react-google-maps/lib/components/addons/MarkerWithLabel";
import {Place} from "../../service";
import {$PlaceSelectionStore, PlaceSelectionState} from "../../store";
import "./place-marker.scss";
import PlaceMarkerPin from "./place-marker.svg";

export interface PlaceMarkerProps {
    place: Place;
    onClick?(marker: Place);
    onMouseOut?(marker: Place);
    onMouseOver?(marker: Place);
}

interface PlaceMarkerState {
    hovering?: boolean;
    selected?: boolean;
}

let AnchorPoint: Point;
const markerPin = <PlaceMarkerPin className="place-marker-pin"/>;

export class PlaceMarker extends PureComponent<PlaceMarkerProps, PlaceMarkerState> {

    constructor(props, context) {
        AnchorPoint = AnchorPoint || new google.maps.Point(16, 48);
        super(props, context);
        this.state = {};
    }

    componentDidMount(): void {
        $PlaceSelectionStore.on(this.onPlaceSelectionChange, this);
    }

    componentWillUnmount(): void {
        $PlaceSelectionStore.off(this.onPlaceSelectionChange, this);
    }

    /** @inheritDoc */
    render() {
        const {place} = this.props;
        const {location, key} = place;
        const {hovering, selected} = this.state;

        const z = hovering ? 1001 : selected ? 1000 : void 0;
        const className = classNames(
            "place-marker",
            selected ? "active" : hovering && "hover",
        );

        return <MarkerWithLabel key={key}
                                zIndex={z}
                                noRedraw={true}
                                position={location}
                                place={{placeId: key, location: location}}
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
        const {place, onClick} = this.props;
        if (onClick) onClick(place);
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

    protected onPlaceSelectionChange(state: PlaceSelectionState) {
        const {place} = this.props;
        const {hover, selection} = state;

        const hovering = hover && hover.key === place.key;
        const selected = selection && selection.key === place.key;
        const dirty = this.state.hovering !== hovering
            || this.state.selected !== selected;

        if (dirty) this.setState({hovering, selected});
    }
}
