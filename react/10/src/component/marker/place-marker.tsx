import {PlaceResult} from "$google/maps/places";
import {autobind} from "core-decorators";
import React, {PureComponent} from "react";
import {Marker} from "react-google-maps";
import {PlaceMarkerInfo} from "./place-marker-info";

export interface PlaceMarkerProps {
    place: PlaceResult;
    active?: boolean;
    onSelect?(marker: PlaceMarker);
    onDestroy?(marker: PlaceMarker);
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
        const {onDestroy} = this.props;
        if (onDestroy) onDestroy(this);
    }

    componentDidUpdate(prev: Readonly<PlaceMarkerProps>): void {
        const {active} = this.props;
        if (active !== prev.active)
            if (!active) this.setShowInfo(false);
    }

    /** @inheritDoc */
    render() {
        const {info} = this.state;
        const {place, active} = this.props;
        const {geometry, place_id} = place;
        const {location} = geometry;
        const showInfo = info && active;

        return <Marker position={location}
                       place={{placeId: place_id, location: location}}
                       onClick={this.toggleInfo}>
            {showInfo && <PlaceMarkerInfo
                place={place}
                onCloseClick={this.toggleInfo}/>}
        </Marker>;
    }

    @autobind
    protected toggleInfo() {
        const {info} = this.state;
        this.setShowInfo(!info);
    }

    private setShowInfo(value: boolean) {
        const {onSelect} = this.props;
        if (value) onSelect && onSelect(this);
        this.setState({info: value});
    }
}
