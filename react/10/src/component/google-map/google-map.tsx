import {GeocoderResult, GeocoderStatus, LatLng, LatLngLiteral, Map} from "$google/maps";
import {withDefaultProps} from "$util";
import {autobind} from "core-decorators";
import PropTypes from "prop-types";
import React, {PureComponent} from "react";
import {GoogleMap as $GoogleMap, withGoogleMap} from "react-google-maps";
import {MAP} from "react-google-maps/src/constants";
import {GoogleMapContext, GoogleMapContextProps} from "../../context";
import "./google-map.scss";

export interface GoogleMapProps {
    defaultZoom?: number
    defaultCenter?: string | LatLng | LatLngLiteral;
    submit?: (query: string) => void;
}

export interface GoogleMapState {
    context: GoogleMapContextProps,
    center?: LatLng | LatLngLiteral
}

const defaultProps: GoogleMapProps = {
    defaultZoom: 13,
};

@withDefaultProps<GoogleMapProps>(defaultProps)
class GoogleMapContainer extends PureComponent<GoogleMapProps, GoogleMapState> {

    static contextTypes = {
        [MAP]: PropTypes.object,
    };

    /** @inheritDoc */
    state = {} as GoogleMapState;

    constructor(props: GoogleMapProps, context: any) {
        super(props, context);
        this.state.context = this.createContext(context[MAP]);
    }

    /** @inheritDoc */
    componentWillReceiveProps(props: Readonly<GoogleMapProps>, context: any): void {
        const map = context[MAP] as Map;
        if (this.state.context.map !== map)
            this.setState({
                context: this.createContext(map),
            });
    }

    /** @inheritDoc */
    componentDidMount(): void {
        // try to detect user location
        const {geolocation} = navigator;
        if (geolocation) geolocation.getCurrentPosition(this.setGeoLocationPosition, this.resolveGeocodeLocation);
        else this.resolveGeocodeLocation();
    }

    /** @inheritDoc */
    render() {
        const {children, defaultZoom} = this.props;
        const {center, context} = this.state;

        return <$GoogleMap defaultZoom={defaultZoom}
                           center={center}>
            <GoogleMapContext.Provider value={context}>
                {children}
            </GoogleMapContext.Provider>
        </$GoogleMap>;
    }

    protected createContext(map: Map): GoogleMapContextProps {
        return {
            map,
            placesService: new google.maps.places.PlacesService(map),
            geocoder: new google.maps.Geocoder(),
        };
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
        const {geocoder} = this.state.context;
        switch (typeof defaultCenter) {
            case "string":
                geocoder.geocode({address: defaultCenter as string}, this.onResolveGeocodeComplete);
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
