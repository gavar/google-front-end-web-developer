import {Map as $GoogleMap} from "$google/maps";
import {autobind} from "core-decorators";
import React, {Component} from "react";
import {Place, placeService} from "../../service";
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
    hoverPlace?: Place;
    activePlace?: Place;
    showNavDrawer: boolean;
    googleMap: $GoogleMap;
}

export class App extends Component<{}, AppState> {

    constructor(props, context) {
        super(props, context);
        this.state = {
            places: [],
            search: null,
            googleMap: null,
            searchPlaces: [],
            showNavDrawer: true,
        };
    }

    /** @inheritDoc */
    render() {
        const {search, searchPlaces, hoverPlace, activePlace, googleMap, showNavDrawer} = this.state;
        return <div className="app">
            <NavDrawer open={showNavDrawer} onToggle={this.toggleNavDrawer}>
                <SearchBox onChange={this.onSearchChange}/>
                <NearbyPlacesList places={searchPlaces}
                                  search={search}
                                  hover={hoverPlace}
                                  active={activePlace}
                                  onHoverChange={this.onHoverPlaceChange}
                                  onActiveChange={this.onActivePlaceChange}/>
            </NavDrawer>
            <GoogleMapsScript libraries={["places"]}
                              googleKey="AIzaSyBCQniJ6Ik1NbOBEbdoH5R-tjGP0aZqlEw">
                <GoogleMap defaultCenter="Latvia, Riga" onGoogleMap={this.setGoogleMap}>
                    <NearbyPlacesTracker map={googleMap}
                                         onNearbyPlacesChanged={this.onNearbyPlacesChanged}/>
                    <PlaceMarkerCluster places={searchPlaces}
                                        hover={hoverPlace}
                                        active={activePlace}
                                        onHoverChange={this.onHoverPlaceChange}
                                        onActiveChange={this.onActivePlaceChange}/>

                </GoogleMap>
            </GoogleMapsScript>
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
    protected setGoogleMap(map: $GoogleMap) {
        const {googleMap} = this.state;
        if (googleMap === map) return;
        placeService.setGoogleMap(map);
        this.setState({googleMap: map});
    }

    @autobind
    protected onSearchChange(search: string) {
        const {places} = this.state;
        const searchPlaces = filterPlaces(places, search);
        this.setState({search, searchPlaces});
    }

    @autobind
    protected onActivePlaceChange(place: Place) {
        this.setState({activePlace: place});
        const {googleMap} = this.state;
        if (place) googleMap.panTo(place.location);
    }

    @autobind
    protected onHoverPlaceChange(place: Place) {
        const hoverPlace = place ? place : null;
        this.setState({hoverPlace});
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
