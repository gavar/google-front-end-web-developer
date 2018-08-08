import {identity} from "$util";
import React, {Component} from "react";
import {Address, Place} from "../../service";
import "./nearby-place-summary.scss";
import {Star, StarBorder, StarHalf} from "../../icon";

export interface NearbyPlaceProps {
    place: Place;
    onClick?(place: Place);
    onDidMount?(place: Place);
}

export class NearbyPlaceSummary extends Component<NearbyPlaceProps> {

    componentDidMount(): void {
        const {place, onDidMount} = this.props;
        if (onDidMount) onDidMount(place);
    }

    render() {
        const {place} = this.props;
        const {name, rating, reviews, address, vicinity} = place;

        return <div className="nearby-place-summary">
            <h3 className="nearby-place-summary-title">{name}</h3>
            {RatingView(rating, reviews)}
            {AddressView(address, vicinity, "nearby-place-summary-address")}
        </div>;
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

const star = <li><Star/></li>;
const starHalf = <li><StarHalf/></li>;
const starEmpty = <li><StarBorder/></li>;

export function RatingStars(rating: number) {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        const v = rating - i;
        if (v >= .5) stars.push(star);
        else if (v >= .25) stars.push(starHalf);
        else stars.push(starEmpty);
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
