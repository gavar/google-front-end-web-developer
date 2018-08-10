import {LatLngLiteral} from "$google/maps";
import {classNames, identity} from "$util";
import {autobind} from "core-decorators";
import React, {PureComponent, ReactChild} from "react";
import {InfoWindow} from "react-google-maps";
import {$PlaceService, Place} from "../../service";
import {$PlaceSelectionStore, PlaceSelectionState} from "../../store";
import {AddressView, RatingView} from "../nearby-places";
import "./place-marker-info.scss";

export interface PlaceMarkerInfoProps {
    onCloseClick?(place: Place): void;
}

export interface PlaceMarkerInfoState {
    key?: string,
    place?: Place;
    loading?: boolean
    location?: LatLngLiteral
}

export class PlaceMarkerInfo extends PureComponent<PlaceMarkerInfoProps, PlaceMarkerInfoState> {

    protected readonly store = $PlaceSelectionStore;
    protected readonly placeService = $PlaceService;

    /** @inheritDoc */
    state: PlaceMarkerInfoState = {};

    /** @inheritDoc */
    componentDidMount(): void {
        this.onPlaceSelectionChange(this.store.state);
        this.store.on(this.onPlaceSelectionChange, this);
    }

    /** @inheritDoc */
    componentWillUnmount(): void {
        this.store.off(this.onPlaceSelectionChange, this);
    }

    /** @inheritDoc */
    render() {
        const {place, location, loading} = this.state;

        // do not render without location
        if (location == null)
            return null;

        const full = place && place.detailed;
        const className = classNames(
            "place-marker-info",
            place ? "show" : "hide",
            full ? "full" : "partial",
            !full && loading && "loading",
        );

        return <InfoWindow
            position={location}
            onCloseClick={this.onCloseClick}>
            <div className={className}>
                {place && table(place) || null}
                {loading && "loading..." || null}
            </div>
        </InfoWindow>;
    }

    protected show(next: Place) {
        let {key, place, location} = this.state;
        if (key === next.key) return;

        key = next.key;
        place = next;
        location = next && next.location || location;

        this.setState({
            key,
            place,
            location,
            loading: true,
        });

        this.placeService.fetchDetails(next.key, this.onReceiveDetails);
    }

    protected hide() {
        if (!this.state.key)
            return;

        // NOTE: keeping last location
        this.setState({
            key: null,
            place: null,
            loading: false,
        });
    }

    protected onPlaceSelectionChange(state: PlaceSelectionState) {
        const {selection} = state;
        if (selection) this.show(selection);
        else this.hide();
    }

    @autobind
    protected onReceiveDetails(key: string, details: Place, remote: boolean) {
        // check if actual request
        if (this.state.key !== key)
            return;

        let {place, location, loading} = this.state;
        place = details || place;
        location = place.location || location;
        if (remote) loading = false;

        this.setState({
            place,
            loading,
            location,
        });
    }

    @autobind
    protected onCloseClick() {
        const {place} = this.state;
        const {onCloseClick} = this.props;
        if (onCloseClick) onCloseClick(place);
        this.hide();
    }
}

function table(place: Place) {
    const {
        name, icon, phone,
        rating, reviews, website,
        address, vicinity,
    } = place;

    const rows = place && [
        name && row(<img src={icon}/>, Title(name, website), "name"),
        place.detailed && row("Address:", AddressView(address, vicinity), "address"),
        row("Phone:", Phone(phone), "phone"),
        row("Rating:", RatingView(rating, reviews), "rating"),
        row("Website:", Website(website), "website"),
    ].filter(identity);

    return rows && <table>
        <tbody>{rows}</tbody>
    </table> || null;
}

function Title(name: string, website: string) {
    website = website || "#";
    return <a target="_blank" href={website}>{name}</a>;
}

function Phone(phone: string) {
    if (!phone) return null;
    const href = `tel:${phone}`;
    const text = phone.replace(/ /g, "-");
    return <a href={href}>{clamp(text)}</a>;
}

function Website(website: string) {
    if (!website) return;
    let text = website.trim();

    const protocol = text.indexOf("://");
    if (protocol >= 0)
        text = text.slice(protocol + 3);

    if (text.startsWith("www."))
        text = text.slice(4);

    if (text.endsWith("/"))
        text = text.slice(0, -1);

    return <a target="_blank" href={website}>{clamp(text)}</a>;
}

function clamp(text: string, maxLength: number = 35) {
    if (!text) return text;
    text = text.trim();
    if (text.length > maxLength)
        text = text.slice(0, maxLength - 3) + "...";
    return text;
}

function row(label: ReactChild, value: ReactChild, className?: string) {
    return value && <tr key={className} className={className}>
        <td className="info-label">{label}</td>
        <td className="info-value">{value}</td>
    </tr> || null;
}
