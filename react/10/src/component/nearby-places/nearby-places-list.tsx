import React, {Component} from "react";
import {Place} from "../../service";
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
            content = <div className="nearby-places-empty">
                <p className="subtitle-1 text-primary">No places found matching search criteria</p>
                <p className="subtitle-2 text-secondary">To see more results, try changing search criteria.</p>
            </div>;
        }
        else {
            content = <div className="nearby-places-empty">
                <p className="subtitle-1 text-primary">No places found in the area</p>
                <p className="subtitle-2 text-secondary">To see more results, try panning or zooming the map.</p>
            </div>;
        }

        return <div className="nearby-places">
            {content}
        </div>;
    }
}

function NearbyPlaceItem(this: NearbyPlacesListProps, place: Place, index: number) {
    return <li key={index} className="nearby-places-list-item">
        <NearbyPlaceSummary key={place.key}
                            place={place}
                            onDidMount={this.onDidMount}/>
    </li>;
}
