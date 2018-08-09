import {identity} from "$util";
import {autobind} from "core-decorators";
import React, {PureComponent, ReactChild} from "react";
import {InfoWindow} from "react-google-maps";
import {Place, placeService} from "../../service";
import {AddressView} from "../nearby-places";
import "./marker-info.scss";

const empty: Place = {} as any;

export interface PlaceMarkerInfoProps {
    place: Place;
    onCloseClick?(place: Place): void;
}

export interface PlaceMarkerInfoState {
    details?: Place;
}

export class PlaceMarkerInfo extends PureComponent<PlaceMarkerInfoProps, PlaceMarkerInfoState> {
    /** @inheritDoc */
    state = {} as PlaceMarkerInfoState;

    /** @inheritDoc */
    componentDidMount(): void {
        const {place} = this.props;
        this.fetchDetails(place.key);
    }

    /** @inheritDoc */
    componentDidUpdate(prev: Readonly<PlaceMarkerInfoProps>): void {
        const {place} = this.props;
        if (prev.place != place) {
            this.setState({details: null});
            this.fetchDetails(place.key);
        }
    }

    /** @inheritDoc */
    componentWillUnmount(): void {
        this.setState({details: null});
    }

    /** @inheritDoc */
    render() {
        const {place} = this.props;
        const {details} = this.state;
        const {
            name,
            icon,
            phone,
            rating,
            website,
            address,
            location,
            vicinity,
        } = details || place || empty;

        const rows = details && [
            // TITLE
            name && row(<img src={icon}/>,
                <a target="_blank" href={website || "#"}>{name}</a>,
                "name"),

            // ADDRESS
            address && row("Address:",
                AddressView(address, vicinity),
                "address"),

            // PHONE
            phone && row("Phone:",
                <a href={`tel:${phone}`}>
                    {phone.replace(/ /g, "-")}
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
        ].filter(identity);

        const table = rows && <table>
            <tbody>{rows}</tbody>
        </table>;

        return <InfoWindow
            position={location}
            onCloseClick={this.onCloseClick}>
            <div className={"place-marker-info"}>
                {table}
            </div>
        </InfoWindow>;
    }

    protected fetchDetails(placeKey: string) {
        if (placeKey)
            placeService.fetchDetails(placeKey, this.onReceiveDetails);
    }

    @autobind
    protected onReceiveDetails(details: Place) {
        // is request actual?
        const {place} = this.props;
        if (place && place.key === details.key)
            this.setState({details});
    }

    @autobind
    protected onCloseClick() {
        const {place, onCloseClick} = this.props;
        if (onCloseClick) onCloseClick(place);
    }
}

function row(label: ReactChild, value: ReactChild, className?: string) {
    return <tr key={className} className={className}>
        <td className="info-label">{label}</td>
        <td className="info-value">{value}</td>
    </tr>;
}
