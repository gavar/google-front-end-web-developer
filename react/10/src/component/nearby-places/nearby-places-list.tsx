import React, {Component} from "react";
import {Place} from "../../service";
import {Typography} from "../../view";
import {NearbyPlaceSummary} from "./nearby-place-summary";
import "./nearby-places-list.scss";

export interface NearbyPlacesListProps {
    places: Place[];
    filter: string;
    onDidMount?(place: Place);
}

interface NearbyPlacesListState {

}

export class NearbyPlacesList extends Component<NearbyPlacesListProps> {

    /** @inheritDoc */
    render() {
        const {places, filter} = this.props;
        const regex = filter && new RegExp(filter, "i");
        const filtered = regex ? places.filter(filterPlaces, regex) : places;
        const size = filtered ? filtered.length : 0;

        let content;
        if (size > 0) {
            const items = filtered.map(NearbyPlaceItem, this.props);
            content = <ul className="nearby-places-list">
                {items}
            </ul>;
        }
        else if (filter) {
            content = <>
                <Typography>No places found matching search criteria</Typography>
                <Typography>To see more results, try changing search criteria.</Typography>
            </>;
        }
        else {
            content = <>
                <Typography>No places found in the area</Typography>
                <Typography>To see more results, try panning or zooming the map.</Typography>
            </>;
        }

        return <div className="nearby-places">
            {content}
        </div>;
    }
}

function filterPlaces(this: RegExp, place: Place) {
    const {name, phone, website, address, vicinity} = place;
    if (name && name.match(this)) return true;
    if (vicinity && vicinity.match(this)) return true;
    if (address) {
        const {country, city, street} = address;
        if (street && street.match(this)) return true;
        if (city && city.match(this)) return true;
        if (country && country.match(this)) return true;
    }
    if (phone && phone.match(this)) return true;
    if (website && website.match(this)) return true;
}

function NearbyPlaceItem(this: NearbyPlacesListProps, place: Place) {
    return <li key={place.key}>
        <NearbyPlaceSummary place={place}
                            onDidMount={this.onDidMount}/>
    </li>;
}
