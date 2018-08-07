import {identity, withContextProps} from "$util";
import {autobind} from "core-decorators";
import React, {PureComponent, ReactChild} from "react";
import {InfoWindow} from "react-google-maps";
import {ApplicationContext, ApplicationContextProps} from "../../context";
import {Place, PlaceService} from "../../service";
import "./marker-info.scss";

const EMPTY_PLACE: Place = {} as any;

function contextToProps(props: ApplicationContextProps): Partial<PlaceMarkerInfoProps> {
    const {placeService} = props;
    return {placeService};
}

export interface PlaceMarkerInfoProps {
    placeKey: string;
    placeService?: PlaceService,
    onCloseClick?(): void;
}

export interface PlaceMarkerInfoState {
    place?: Place;
}

@withContextProps(ApplicationContext, contextToProps)
export class PlaceMarkerInfo extends PureComponent<PlaceMarkerInfoProps, PlaceMarkerInfoState> {
    /** @inheritDoc */
    state = {} as PlaceMarkerInfoState;

    /** @inheritDoc */
    componentDidMount(): void {
        const {placeKey} = this.props;
        this.fetchDetails(placeKey);
    }

    /** @inheritDoc */
    componentDidUpdate(prev: Readonly<PlaceMarkerInfoProps>): void {
        const {placeKey} = this.props;
        if (prev.placeKey != placeKey) {
            this.setState({place: null});
            this.fetchDetails(placeKey);
        }
    }

    /** @inheritDoc */
    componentWillUnmount(): void {
        this.setState({place: null});
    }

    /** @inheritDoc */
    render() {
        const {place} = this.state;
        const {onCloseClick} = this.props;

        const {
            name,
            icon,
            phone,
            rating,
            website,
            vicinity,
        } = place || EMPTY_PLACE;

        const rows = place && [
            // TITLE
            name && row(<img src={icon}/>,
                <a target="_blank" href={website || "#"}>{name}</a>,
                "name"),

            // ADDRESS
            vicinity && row("Address:",
                <address>{vicinity.split(",", 1)[0]}</address>,
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

        return <InfoWindow onCloseClick={onCloseClick}>
            <div className={"place-marker-info"}>
                {table}
            </div>
        </InfoWindow>;
    }

    protected fetchDetails(placeKey: string) {
        if (placeKey) {
            const {placeService} = this.props;
            placeService.fetchDetails(placeKey, this.onReceiveDetails);
        }
    }

    @autobind
    protected onReceiveDetails(place: Place) {
        // is request actual?
        const {placeKey} = this.props;
        if (place.key === placeKey)
            this.setState({place});
    }
}

function row(label: ReactChild, value: ReactChild, className?: string) {
    return <tr key={className} className={className}>
        <td className="info-label">{label}</td>
        <td className="info-value">{value}</td>
    </tr>;
}
