import {identity} from "$util";
import React, {Component} from "react";
import {Address, Place} from "../../service";
import {Typography} from "../../view";
import "./nearby-place-summary.scss";

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
            <Typography className="title">{name}</Typography>
            {RatingView(rating, reviews)}
            {AddressView(address, vicinity)}
        </div>;
    }
}

export function RatingView(rating: number, reviews: number) {
    // TODO: stars
    return rating &&
        <div className="nearby-place-summary-rating">
            <span className="value">{rating.toFixed(1)} / 5.0</span>
            {reviews && <span className="reviews">({reviews})</span> || null}
        </div> || null;
}

export function AddressView(address: Address, vicinity: string) {
    const content = address
        ? [address.street, address.city].filter(identity).join(", ")
        : vicinity;

    return content &&
        <address>
            {content}
        </address> || null;
}
