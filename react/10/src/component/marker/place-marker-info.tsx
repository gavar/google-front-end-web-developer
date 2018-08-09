import {identity} from "$util";
import {autobind} from "core-decorators";
import React, {PureComponent, ReactChild} from "react";
import {InfoWindow} from "react-google-maps";
import {$PlaceService, Place} from "../../service";
import {$PlaceSelectionStore, PlaceSelectionState} from "../../store";
import {AddressView} from "../nearby-places";
import "./marker-info.scss";

const empty: Place = {} as any;

export interface PlaceMarkerInfoProps {
    onCloseClick?(place: Place): void;
}

export interface PlaceMarkerInfoState {
    place?: Place;
    details?: Place;
}

export class PlaceMarkerInfo extends PureComponent<PlaceMarkerInfoProps, PlaceMarkerInfoState> {

    protected readonly store = $PlaceSelectionStore;
    protected readonly placeService = $PlaceService;

    /** @inheritDoc */
    state = {} as PlaceMarkerInfoState;

    /** @inheritDoc */
    componentDidMount(): void {
        const {selection} = this.store.state;
        if (selection) this.fetchDetails(selection.key);
        this.store.on(this.onPlaceSelectionChange, this);
    }

    /** @inheritDoc */
    componentWillUnmount(): void {
        this.store.off(this.onPlaceSelectionChange, this);
    }

    /** @inheritDoc */
    render() {
        const {place, details} = this.state;

        // do not render if not selected place
        if (!place)
            return null;

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
            this.placeService.fetchDetails(placeKey, this.onReceiveDetails);
    }

    @autobind
    protected onReceiveDetails(details: Place) {
        // is request actual?
        const {place} = this.state;
        if (place && place.key === details.key)
            this.setState({details});
    }

    @autobind
    protected onCloseClick() {
        const {place} = this.state;
        const {onCloseClick} = this.props;
        if (onCloseClick) onCloseClick(place);
    }

    protected onPlaceSelectionChange(state: PlaceSelectionState) {
        const {place} = this.state;
        const {selection} = state;

        if (selection) {
            // showing same place?
            if (place && place.key === selection.key)
                return;

            // fetch details & show
            this.setState({
                place: selection,
                details: null,
            });
            this.fetchDetails(selection.key);
        }
        else if (place) {
            // hide window if no selection
            this.setState({
                place: null,
                details: null,
            });
        }
    }
}

function row(label: ReactChild, value: ReactChild, className?: string) {
    return <tr key={className} className={className}>
        <td className="info-label">{label}</td>
        <td className="info-value">{value}</td>
    </tr>;
}
