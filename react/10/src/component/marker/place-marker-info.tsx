import {PlaceDetailsRequest, PlaceResult, PlacesService, PlacesServiceStatus} from "$google/maps/places";
import {withContextProps} from "$util";
import {autobind} from "core-decorators";
import React, {PureComponent, ReactChild} from "react";
import {InfoWindow} from "react-google-maps";
import {GoogleMapContext, GoogleMapContextProps} from "../../context";

function contextToProps(props: GoogleMapContextProps): Partial<PlaceMarkerInfoProps> {
    const {placesService} = props;
    return {placesService};
}

export interface PlaceMarkerInfoProps {
    placesService?: PlacesService,
    place: PlaceResult;
    onCloseClick?(): void;
}

export interface PlaceMarkerInfoState {
    details?: PlaceResult;
}

@withContextProps(GoogleMapContext, contextToProps)
export class PlaceMarkerInfo extends PureComponent<PlaceMarkerInfoProps, PlaceMarkerInfoState> {
    /** @inheritDoc */
    state = {} as PlaceMarkerInfoState;

    /** @inheritDoc */
    componentDidMount(): void {
        const {place} = this.props;
        this.fetchDetails(place);
    }

    /** @inheritDoc */
    componentDidUpdate(prev: Readonly<PlaceMarkerInfoProps>): void {
        const {place} = this.props;
        if (prev.place.place_id != place.place_id) {
            this.setState({details: null});
            this.fetchDetails(place);
        }
    }

    /** @inheritDoc */
    componentWillUnmount(): void {
        this.setState({details: null});
    }

    /** @inheritDoc */
    render() {
        const {details} = this.state;
        if (!details) return "";

        const {onCloseClick, place} = this.props;
        const {
            name,
            icon,
            rating,
            website,
            vicinity,
            international_phone_number,
        } = details || place;

        const tbody = [
            // TITLE
            row(<img src={icon}/>,
                <a target="_blank" href={website || "#"}>{name}</a>,
                "name"),

            // ADDRESS
            row("Address:",
                <address>{vicinity.split(",", 1)[0]}</address>,
                "address"),

            // PHONE
            international_phone_number && row("Phone:",
                <a href={`tel:${international_phone_number}`}>
                    {international_phone_number.replace(/ /g, "-")}
                </a>,
                "phone"),

            // RATING
            rating && row("Rating:",
                `${rating} / 5`,
                "rating"),

            // WEBSITE
            website && row("Website:",
                <a target="_blank" href={website}>{website}</a>,
                "website"),
        ];

        return <InfoWindow onCloseClick={onCloseClick}>
            <div className={"place-marker-info"}>
                <table>
                    <tbody>{tbody}</tbody>
                </table>
            </div>
        </InfoWindow>;
    }

    protected fetchDetails(place: PlaceResult) {
        const {placesService} = this.props;
        const request: PlaceDetailsRequest = {
            placeId: place.place_id,
        };
        placesService.getDetails(request, this.onReceiveDetails);
    }

    @autobind
    protected onReceiveDetails(details: PlaceResult, status: PlacesServiceStatus) {
        if (status !== google.maps.places.PlacesServiceStatus.OK)
            return;

        // is request actual?
        if (details.place_id === this.props.place.place_id)
            this.setState({details});
    }
}

function row(label: ReactChild, value: ReactChild, className?: string) {
    return <tr key={className} className={className}>
        <td className="info-label">{label}</td>
        <td className="info-value">{value}</td>
    </tr>;
}
