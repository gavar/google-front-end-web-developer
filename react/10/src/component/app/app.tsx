import {PlaceResult} from "$google/maps/places";
import {autobind} from "core-decorators";
import React, {Component} from "react";
import {AppBarTop} from "../app-bar";
import {GoogleMap, GoogleMapsScript} from "../google-map";
import {PlaceMarkerCluster} from "../marker";
import {NavDrawer} from "../nav-drawer";
import {NearbyPlacesTracker} from "../nearby-places";
import {SearchBox} from "../search-box";
import "./app.scss";

export interface AppState {
    showNavDrawer: boolean;
    places: PlaceResult[];
}

export class App extends Component<{}, AppState> {

    constructor(props, context) {
        super(props, context);
        this.state = {
            showNavDrawer: false,
            places: [],
        };
    }

    /** @inheritDoc */
    render() {
        const {places, showNavDrawer} = this.state;

        return <div className="app">
            <AppBarTop title="Car Wash Map" onNavClick={this.toggleNavDrawer}/>
            <NavDrawer open={showNavDrawer}>
                <SearchBox/>
            </NavDrawer>
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

    @autobind
    protected toggleNavDrawer() {
        let {showNavDrawer} = this.state;
        showNavDrawer = !showNavDrawer;
        this.setState({showNavDrawer});
    }
}
