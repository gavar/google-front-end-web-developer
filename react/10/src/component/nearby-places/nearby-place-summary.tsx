import {classNames, identity} from "$util";
import {autobind} from "core-decorators";
import React, {Component, MouseEvent} from "react";
import {Star, StarBorder, StarHalf} from "../../icon";
import {Address, Place} from "../../service";
import {ButtonBase} from "../../view";
import "./nearby-place-summary.scss";

export interface NearbyPlaceProps {
    hover?: boolean;
    selected?: boolean;
    place: Place;
    onClick?(place: Place);
    onMouseOver?(place: Place);
    onMouseOut?(place: Place);
    onDidMount?(place: Place);
}

export class NearbyPlaceSummary extends Component<NearbyPlaceProps> {

    componentDidMount(): void {
        const {place, onDidMount} = this.props;
        if (onDidMount) onDidMount(place);
    }

    render() {
        const {place, hover, selected} = this.props;
        const {name, rating, reviews, address, vicinity} = place;

        const className = classNames(
            "nearby-place-summary",
            hover && "hover",
            selected && "selected",
        );

        return <ButtonBase role="tab"
                           aria-selected={selected}
                           className={className}
                           onClick={this.onClick}
                           onMouseOver={this.onMouseOver}
                           onMouseOut={this.onMouseOut}>
            <div className="nearby-place-summary-info">
                <h3 className="nearby-place-summary-title">{name}</h3>
                {RatingView(rating, reviews)}
                {AddressView(address, vicinity, "nearby-place-summary-address")}
            </div>
            {PhotoView(place, "nearby-place-summary-image")}
        </ButtonBase>;
    }

    @autobind
    protected onClick(e: MouseEvent) {
        const {place, onClick} = this.props;
        if (onClick) onClick(place);
    }

    @autobind
    protected onMouseOver(e: MouseEvent) {
        const {place, onMouseOver} = this.props;
        if (onMouseOver) onMouseOver(place);
    }

    @autobind
    protected onMouseOut(e: MouseEvent) {
        const {place, onMouseOut} = this.props;
        if (onMouseOut) onMouseOut(place);
    }
}

export function RatingView(rating: number, reviews: number) {
    if (!rating) return null;

    const stars = RatingStars(rating);
    const $rating = rating.toFixed(1);

    return rating &&
        <span className="nearby-place-summary-rating">
            <span className="nearby-place-summary-rating-value">{$rating}</span>
            <ol className="nearby-place-summary-rating-stars">{stars}</ol>
            {reviews && <span className="nearby-place-summary-rating-reviews">({reviews})</span> || null}
        </span> || null;
}

export function RatingStars(rating: number) {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        const v = rating - i;
        if (v >= .5) stars.push(<li key={i}><Star/></li>);
        else if (v >= .25) stars.push(<li key={i}><StarHalf/></li>);
        else stars.push(<li key={i}><StarBorder/></li>);
    }
    return stars;
}

export function AddressView(address: Address, vicinity: string, className?: string) {
    const content = address
        ? [address.street, address.city].filter(identity).join(", ")
        : vicinity;

    return content &&
        <address className={className}>
            {content}
        </address> || null;
}

export function PhotoView(place: Place, className?: string) {
    const {name, photo} = place;
    if (!photo) return null;
    return <img className={className}
                src={photo}
                alt={`${name} image`}/>;
}
