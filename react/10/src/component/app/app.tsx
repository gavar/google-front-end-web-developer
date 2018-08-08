import {Map} from "$google/maps";
import {autobind} from "core-decorators";
import React, {Component} from "react";
import {ApplicationContext, ApplicationContextProps} from "../../context";
import {Place, PlaceService} from "../../service";
import {AppBarTop} from "../app-bar";
import {GoogleMap, GoogleMapsScript} from "../google-map";
import {PlaceMarkerCluster} from "../marker";
import {NavDrawer} from "../nav-drawer";
import {NearbyPlacesTracker} from "../nearby-places";
import {SearchBox} from "../search-box";
import "./app.scss";

export interface AppState {
    showNavDrawer: boolean;
    search: string;
    places: Place[];
    context: ApplicationContextProps;
}

export class App extends Component<{}, AppState> {

    constructor(props, context) {
        super(props, context);
        this.state = {
            showNavDrawer: false,
            search: null,
            places: [],
            context: {
                map: null,
                placeService: new PlaceService(),
            },
        };
    }

    /** @inheritDoc */
    render() {
        const {places, showNavDrawer} = this.state;
        return <div className="app">
            <ApplicationContext.Provider value={this.state.context}>
                <AppBarTop title="Car Wash Map" onNavClick={this.toggleNavDrawer}/>
                <NavDrawer open={showNavDrawer}>
                    <SearchBox onChange={this.onSearchChange}/>
                </NavDrawer>
                <GoogleMapsScript libraries={["places"]}
                                  googleKey="AIzaSyBCQniJ6Ik1NbOBEbdoH5R-tjGP0aZqlEw">
                    <GoogleMap defaultCenter="Latvia, Riga" onGoogleMap={this.setGoogleMap}>
                        <NearbyPlacesTracker onNearbyPlacesChanged={this.onNearbyPlacesChanged}/>
                        <PlaceMarkerCluster places={places}/>
                    </GoogleMap>
                </GoogleMapsScript>
            </ApplicationContext.Provider>
        </div>;
    }

    @autobind
    protected onNearbyPlacesChanged(places: Place[]) {
        this.setState({places});
    }

    @autobind
    protected toggleNavDrawer() {
        let {showNavDrawer} = this.state;
        showNavDrawer = !showNavDrawer;
        this.setState({showNavDrawer});
    }

    @autobind
    protected setGoogleMap(map: Map) {
        const {context} = this.state;
        if (context.map === map) return;

        context.map = map;
        const {placeService} = context;
        placeService.setGoogleMap(map);
        this.forceUpdate();
    }

    @autobind
    protected onSearchChange(search: string) {
        this.setState({search});
    }
}
