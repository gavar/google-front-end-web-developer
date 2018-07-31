import {Geocoder, LatLng, LatLngLiteral, Map} from "$google/maps";
import {PlacesService} from "$google/maps/places";
import React from "react";

export const GoogleMapContext = React.createContext<GoogleMapContextProps>({
    map: null,
    placesService: null,
    geocoder: null,
});

export interface GoogleMapContextProps {
    map: Map,
    placesService: PlacesService,
    geocoder: Geocoder,
    center?: LatLng | LatLngLiteral
}
