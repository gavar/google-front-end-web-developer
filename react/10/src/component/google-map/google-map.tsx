import {Geocoder, GeocoderResult, GeocoderStatus, LatLng, LatLngLiteral, Map} from "$google/maps";
import {autobind} from "core-decorators";
import PropTypes from "prop-types";
import React, {ComponentType, PureComponent} from "react";
import {GoogleMap as $GoogleMap, withGoogleMap} from "react-google-maps";
import {MAP} from "react-google-maps/src/constants";
import "./google-map.scss";

export interface WithGoogleMapProps {
    map: Map;
}

export interface GoogleMapProps {
    onGoogleMap?(map: Map);
    defaultZoom?: number
    defaultCenter?: string | LatLng | LatLngLiteral;

    /** Component to mount when google map is ready. */
    component?: ComponentType<WithGoogleMapProps>;
}

export interface GoogleMapState {
    map: Map;
    center?: LatLng | LatLngLiteral
}

class GoogleMapContainer extends PureComponent<GoogleMapProps, GoogleMapState> {

    static readonly contextTypes = {
        [MAP]: PropTypes.object,
    };

    static readonly defaultProps: GoogleMapProps = {
        defaultZoom: 13,
    };

    protected geocoder: Geocoder;

    constructor(props: GoogleMapProps, context: any) {
        super(props, context);
        this.state = {map: context[MAP]};
        this.onGoogleMap(this.state.map);
    }

    /** @inheritDoc */
    componentDidMount(): void {
        this.geocoder = new google.maps.Geocoder();
        // try to detect user location
        const {geolocation} = navigator;
        if (geolocation) geolocation.getCurrentPosition(this.setGeoLocationPosition, this.resolveGeocodeLocation);
        else this.resolveGeocodeLocation();
    }

    /** @inheritDoc */
    render() {
        const {center, map} = this.state;
        const {children, defaultZoom, component: Component} = this.props;
        const content = map && Component && <Component map={map}/> || null;

        return <$GoogleMap defaultZoom={defaultZoom}
                           center={center}>
            {children}
            {content}
        </$GoogleMap>;
    }

    protected setCenter(center: LatLng | LatLngLiteral) {
        this.setState({center});
    }

    @autobind
    protected setGeoLocationPosition(position: Position) {
        this.setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        });
    }

    @autobind
    protected resolveGeocodeLocation() {
        const {defaultCenter} = this.props;
        switch (typeof defaultCenter) {
            case "string":
                this.geocoder.geocode({address: defaultCenter as string}, this.onResolveGeocodeComplete);
                break;
            case "object":
                this.setCenter(defaultCenter as LatLngLiteral);
                break;
        }
    }

    @autobind
    protected onResolveGeocodeComplete(results: GeocoderResult[], status: GeocoderStatus) {
        if (results && results.length)
            this.setCenter(results[0].geometry.location);
    }

    onGoogleMap(map: Map) {
        const {onGoogleMap} = this.props;
        if (onGoogleMap) onGoogleMap(map);
    }
}

const WithGoogleMap = withGoogleMap(GoogleMapContainer);

export class GoogleMap extends PureComponent<GoogleMapProps> {
    /** @inheritDoc */
    render() {
        return <WithGoogleMap containerElement={<div className="google-map-container"/>}
                              mapElement={<div className="google-map"/>}
                              {...this.props}>
        </WithGoogleMap>;
    }
}
