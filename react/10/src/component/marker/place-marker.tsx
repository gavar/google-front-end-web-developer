import {PlaceResult} from "$google/maps/places";
import {autobind} from "core-decorators";
import React, {PureComponent} from "react";
import {Marker} from "react-google-maps";
import {PlaceMarkerInfo} from "./place-marker-info";

export interface PlaceMarkerProps {
    place: PlaceResult;
    active?: boolean;
    onSelect?(place: PlaceMarker): void,
}

export interface PlaceMarkerState {
    info: boolean;
}

export class PlaceMarker extends PureComponent<PlaceMarkerProps, PlaceMarkerState> {

    static readonly defaultProps: Partial<PlaceMarkerProps> = {
        active: true,
    };

    /** @inheritDoc */
    state = {
        info: false,
    };

    /** @inheritDoc */
    componentWillUnmount(): void {
        this.setState({info: false});
    }

    /** @inheritDoc */
    render() {
        const {info} = this.state;
        const {place, active} = this.props;
        const {geometry, place_id} = place;
        const {location} = geometry;
        const showInfo = info && active;

        return <Marker position={location}
                       noRedraw={true}
                       place={{placeId: place_id, location: location}}
                       onClick={this.toggleInfo}>
            {showInfo && <PlaceMarkerInfo
                place={place}
                onCloseClick={this.toggleInfo}/>}
        </Marker>;
    }

    @autobind
    protected toggleInfo() {
        const {onSelect} = this.props;
        const info = !this.state.info;
        if (info) onSelect && onSelect(this);
        this.setState({info});
    }
}
