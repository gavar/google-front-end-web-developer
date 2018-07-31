import {PlaceResult} from "$google/maps/places";
import {autobind} from "core-decorators";
import React, {Component} from "react";
import {GoogleMap, GoogleMapsScript} from "../google-map";
import {PlaceMarkerCluster} from "../marker";
import {NearbyPlacesTracker} from "../nearby-places";
import "./app.scss";

export interface AppState {
    places: PlaceResult[];
}

export class App extends Component<{}, AppState> {

    /** @inheritDoc */
    state = {
        places: [],
    };

    /** @inheritDoc */
    render() {
        const {places} = this.state;

        return <div className="app">
            <GoogleMapsScript libraries={["places"]}
                              googleKey="AIzaSyBCQniJ6Ik1NbOBEbdoH5R-tjGP0aZqlEw">
                <GoogleMap defaultCenter="Latvia, Riga">
                    <NearbyPlacesTracker onPlacesUpdate={this.onPlacesUpdate}/>
                    <PlaceMarkerCluster places={places}/>
                </GoogleMap>
            </GoogleMapsScript>
        </div>;
    }

    @autobind
    protected onPlacesUpdate(places: PlaceResult[]) {
        this.setState({places});
    }
}
