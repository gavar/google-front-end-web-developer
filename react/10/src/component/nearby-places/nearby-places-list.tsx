import React, {Component} from "react";
import {Place} from "../../service";
import {NearbyPlaceSummary} from "./nearby-place-summary";
import "./nearby-places-list.scss";

export interface NearbyPlacesListProps {
    places: Place[];
    search: string;
    onClick?(place: Place);
    onMouseOver?(place: Place);
    onMouseOut?(place: Place);
}

export class NearbyPlacesList extends Component<NearbyPlacesListProps> {

    /** @inheritDoc */
    render() {
        const {places, search} = this.props;
        const size = places && places.length;

        let content;
        if (size) {
            const items = places.map(NearbyPlaceItem, this);
            content = <ul className="nearby-places-list" role="tablist">
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

function NearbyPlaceItem(this: NearbyPlacesList, place: Place) {
    const {key} = place;
    const {onClick, onMouseOver, onMouseOut} = this.props;
    return <li key={key} className="nearby-places-list-item">
        <NearbyPlaceSummary place={place}
                            onClick={onClick}
                            onMouseOver={onMouseOver}
                            onMouseOut={onMouseOut}/>
    </li>;
}
