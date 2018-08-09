import {Map as $GoogleMap} from "$google/maps";
import React from "react";
import {$PlaceService, Place} from "../../service";
import {$PlaceSelectionStore, $PlacesStore} from "../../store";
import {GoogleMap, GoogleMapsScript, WithGoogleMapProps} from "../google-map";
import {PlaceMarkerCluster, PlaceMarkerInfo} from "../marker";
import {NavDrawer} from "../nav-drawer";
import {NearbyPlacesList, NearbyPlacesTracker} from "../nearby-places";
import {SearchBox} from "../search-box";
import "./app.scss";

export function App() {
    return <div className="app">
        <NavDrawer defaultOpen={true}>
            <SearchBox onChange={onSearchChanged}/>
            <NearbyPlacesList onClick={onPlaceClick}
                              onMouseOver={onPlaceMouseOver}
                              onMouseOut={onPlaceMouseOut}/>
        </NavDrawer>
        <GoogleMapsScript libraries={["places"]}
                          googleKey="AIzaSyBCQniJ6Ik1NbOBEbdoH5R-tjGP0aZqlEw">
            <GoogleMap defaultCenter="Latvia, Riga"
                       component={GoogleMapComponents}
                       onGoogleMap={setGoogleMap}/>
        </GoogleMapsScript>
    </div>;
}

function GoogleMapComponents({map}: WithGoogleMapProps) {
    return <>
        <NearbyPlacesTracker map={map}
                             onNearbyPlacesChanged={onNearbyPlacesChanged}/>;
        <PlaceMarkerInfo onCloseClick={onCloseInfoWindow}/>
        <PlaceMarkerCluster onClick={onPlaceClick}
                            onMouseOver={onPlaceMouseOver}
                            onMouseOut={onPlaceMouseOut}/>
    </>;
}

let googleMap: $GoogleMap;
function setGoogleMap(value: $GoogleMap) {
    if (googleMap === value) return;
    googleMap = value;
    $PlaceService.setGoogleMap(value);
}

function onNearbyPlacesChanged(places: Place[]) {
    const {search} = $PlacesStore.state;
    updatePlaces(places, search);
}

function onSearchChanged(search: string) {
    const {places} = $PlacesStore.state;
    updatePlaces(places, search);
}

function updatePlaces(places: Place[], search: string) {
    const searchPlaces = filterPlaces(places, search);
    searchPlaces.sort(sortByRating);
    $PlacesStore.setState({
        places,
        search,
        searchPlaces,
    });
}

function onPlaceClick(place: Place) {
    const {selection} = $PlaceSelectionStore.state;
    if (selection && selection.key == place.key) return;

    googleMap.panTo(place.location);
    $PlaceSelectionStore.setState({selection: place});
}

function onPlaceMouseOver(place: Place) {
    const {hover} = $PlaceSelectionStore.state;
    if (hover && hover.key === place.key) return;
    $PlaceSelectionStore.setState({hover: place});
}

function onPlaceMouseOut(place: Place) {
    const {hover} = $PlaceSelectionStore.state;
    if (hover && hover.key === place.key)
        $PlaceSelectionStore.setState({hover: null});
}

function onCloseInfoWindow(place: Place) {
    $PlaceSelectionStore.setState({selection: null});
}

function filterPlaces(places: Place[], search: string): Place[] {
    if (!search) return places;
    const regex = new RegExp(search, "i");
    places = places.filter(placesByRegex, regex);
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
