import {autobind} from "core-decorators";
import React, {PureComponent} from "react";
import {Marker} from "react-google-maps";
import {Place} from "../../service";
import {PlaceMarkerInfo} from "./place-marker-info";

export interface PlaceMarkerProps {
    place: Place;
    active?: boolean;
    onSelect?(marker: Place);
    onDestroy?(marker: Place);
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
        const {place, onDestroy} = this.props;
        if (onDestroy) onDestroy(place);
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
        const {location, key} = place;
        const showInfo = info && active;

        return <Marker position={location}
                       place={{placeId: key, location: location}}
                       onClick={this.toggleInfo}>
            {showInfo && <PlaceMarkerInfo
                placeKey={key}
                onCloseClick={this.toggleInfo}/>}
        </Marker>;
    }

    @autobind
    protected toggleInfo() {
        const {info} = this.state;
        this.setShowInfo(!info);
    }

    private setShowInfo(value: boolean) {
        const {place, onSelect} = this.props;
        if (value) onSelect && onSelect(place);
        this.setState({info: value});
    }
}
