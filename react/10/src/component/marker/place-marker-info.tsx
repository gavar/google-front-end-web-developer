import {InfoWindow, Map} from "$google/maps";
import {classNames, identity} from "$util";
import {autobind} from "core-decorators";
import PropTypes from "prop-types";
import React, {PureComponent, ReactChild} from "react";
import {MAP} from "react-google-maps/src/constants";
import {$PlaceService, Place} from "../../service";
import {$PlaceSelectionStore, PlaceSelectionState} from "../../store";
import {AddressView, RatingView} from "../nearby-places";
import "./place-marker-info.scss";

export interface PlaceMarkerInfoProps {
    onCloseClick?(place: Place): void;
}

export interface PlaceMarkerInfoState {
    place?: Place;
    loading?: boolean;
}

export class PlaceMarkerInfo extends PureComponent<PlaceMarkerInfoProps, PlaceMarkerInfoState> {

    static contextTypes = {
        [MAP]: PropTypes.object,
    };

    protected readonly store = $PlaceSelectionStore;
    protected readonly placeService = $PlaceService;

    protected map: Map;
    protected content: HTMLDivElement;
    protected infoWindow: InfoWindow;

    /** @inheritDoc */
    state: PlaceMarkerInfoState = {};

    constructor(props, context) {
        super(props, context);
        this.map = context[MAP];
        this.infoWindow = new google.maps.InfoWindow();
    }

    /** @inheritDoc */
    componentDidMount(): void {
        this.onPlaceSelectionChange(this.store.state);
        this.store.on(this.onPlaceSelectionChange, this);
        this.infoWindow.addListener("closeclick", this.onCloseClick);
    }

    /** @inheritDoc */
    componentDidUpdate(props: PlaceMarkerInfoProps, state: PlaceMarkerInfoState): void {
        this.infoWindow.setContent(this.content);
    }

    /** @inheritDoc */
    componentWillUnmount(): void {
        this.infoWindow.close();
        this.infoWindow.unbindAll();
        this.store.off(this.onPlaceSelectionChange, this);
    }

    /** @inheritDoc */
    render() {
        const {place, loading} = this.state;
        const full = place && place.detailed;
        const className = classNames(
            "place-marker-info",
            place ? "show" : "hide",
            full ? "full" : "partial",
            !full && loading && "loading",
        );

        return <div ref={this.setContent} className={className}>
            {place && table(place) || null}
        </div>;
    }

    protected show(next: Place) {
        // ensure showing other then current
        const {place} = this.state;
        if (place && place.key === next.key)
            return;

        // open window
        const position = next && next.location;
        if (position) this.infoWindow.setPosition(position);
        this.infoWindow.open(this.map);

        // update & fetch
        this.setState({place: next, loading: true});
        this.placeService.fetchDetails(next.key, this.onReceiveDetails);
    }

    protected hide() {
        // make sure to close the window
        this.infoWindow.setContent(null);
        this.infoWindow.close();

        this.setState({
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
    protected setContent(content: HTMLDivElement) {
        this.content = content;
    }

    @autobind
    protected onReceiveDetails(key: string, details: Place, remote: boolean) {
        // check if valid response
        const {place, loading} = this.state;
        if (place && place.key !== key)
            return;

        this.setState({
            place: details || place,
            loading: remote ? false : loading,
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
