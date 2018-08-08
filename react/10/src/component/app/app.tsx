import {Map} from "$google/maps";
import {autobind} from "core-decorators";
import React, {Component} from "react";
import {ApplicationContext, ApplicationContextProps} from "../../context";
import {Place, PlaceService} from "../../service";
import {GoogleMap, GoogleMapsScript} from "../google-map";
import {PlaceMarkerCluster} from "../marker";
import {NavDrawer} from "../nav-drawer";
import {NearbyPlacesList, NearbyPlacesTracker} from "../nearby-places";
import {SearchBox} from "../search-box";
import "./app.scss";

export interface AppState {
    search: string;
    places: Place[];
    searchPlaces: Place[];
    showNavDrawer: boolean;
    context: ApplicationContextProps;
}

export class App extends Component<{}, AppState> {

    constructor(props, context) {
        super(props, context);
        this.state = {
            showNavDrawer: true,
            places: [],
            search: null,
            searchPlaces: [],
            context: {
                map: null,
                placeService: new PlaceService(),
            },
        };
    }

    /** @inheritDoc */
    render() {
        const {search, searchPlaces, showNavDrawer} = this.state;

        return <div className="app">
            <ApplicationContext.Provider value={this.state.context}>
                <NavDrawer open={showNavDrawer} onToggle={this.toggleNavDrawer}>
                    <SearchBox onChange={this.onSearchChange}/>
                    <NearbyPlacesList places={searchPlaces} search={search}/>
                </NavDrawer>
                <GoogleMapsScript libraries={["places"]}
                                  googleKey="AIzaSyBCQniJ6Ik1NbOBEbdoH5R-tjGP0aZqlEw">
                    <GoogleMap defaultCenter="Latvia, Riga" onGoogleMap={this.setGoogleMap}>
                        <NearbyPlacesTracker onNearbyPlacesChanged={this.onNearbyPlacesChanged}/>
                        <PlaceMarkerCluster places={searchPlaces}/>
                    </GoogleMap>
                </GoogleMapsScript>
            </ApplicationContext.Provider>
        </div>;
    }

    @autobind
    protected onNearbyPlacesChanged(places: Place[]) {
        const {search} = this.state;
        const searchPlaces = filterPlaces(places, search);
        this.setState({places, searchPlaces});
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
        const {places} = this.state;
        const searchPlaces = filterPlaces(places, search);
        this.setState({search, searchPlaces});
    }
}

function filterPlaces(places: Place[], search: string): Place[] {
    if (search) {
        const regex = new RegExp(search, "i");
        places = places.filter(placesByRegex, regex);
    }
    places.sort(sortByRating);
    return places;
}

function placesByRegex(this: RegExp, place: Place) {
    const {name, address, vicinity} = place;
    if (name && name.match(this)) return true;
    if (vicinity && vicinity.match(this)) return true;
    if (address) {
        const {country, city, street} = address;
        if (street && street.match(this)) return true;
        if (city && city.match(this)) return true;
        if (country && country.match(this)) return true;
    }
}

function sortByRating(a: Place, b: Place) {
    return -compare(a.rating, b.rating)
        || compare(a.name, b.name)
        || compare(a.key, b.key)
        || 0;
}

function compare(a: any, b: any): number {
    if (a === b) return 0;
    if (a == null && b != null) return -1;
    if (a != null && b == null) return 1;
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
}
