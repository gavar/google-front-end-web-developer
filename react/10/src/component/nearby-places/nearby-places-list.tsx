import React, {Component} from "react";
import {Place} from "../../service";
import {Typography} from "../../view";
import {NearbyPlaceSummary} from "./nearby-place-summary";
import "./nearby-places-list.scss";

export interface NearbyPlacesListProps {
    places: Place[];
    search: string;
    onDidMount?(place: Place);
}

interface NearbyPlacesListState {

}

export class NearbyPlacesList extends Component<NearbyPlacesListProps> {

    /** @inheritDoc */
    render() {
        const {places, search} = this.props;
        const size = places.length;

        let content;
        if (size > 0) {
            const items = places.map(NearbyPlaceItem, this.props);
            content = <ul className="nearby-places-list">
                {items}
            </ul>;
        }
        else if (search) {
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

function NearbyPlaceItem(this: NearbyPlacesListProps, place: Place) {
    return <li key={place.key}>
        <NearbyPlaceSummary place={place}
                            onDidMount={this.onDidMount}/>
    </li>;
}
