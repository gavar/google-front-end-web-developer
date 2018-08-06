import {Geocoder, Map} from "$google/maps";
import {
    PlaceDetailsRequest,
    PlaceResult,
    PlaceSearchPagination,
    PlaceSearchRequest,
    PlacesService,
    PlacesServiceStatus,
} from "$google/maps/places";

export class PlaceService {

    protected geocoder: Geocoder;
    protected service: PlacesService;

    setGoogleMap(map: Map) {
        this.geocoder = new google.maps.Geocoder();
        this.service = new google.maps.places.PlacesService(map);
    }

    fetchDetails(id: string, listener: PlaceListener) {
        const request: PlaceDetailsRequest = {
            placeId: id,
        };
        this.service.getDetails(request, listener);
    }

    nearbySearch(request: PlaceSearchRequest, listener: PlacesListener) {
        this.service.nearbySearch(request, callback);
        function callback(places: PlaceResult[], status: PlacesServiceStatus, pagination: PlaceSearchPagination) {
            listener(places, pagination);
        }
    }
}

export interface PlaceListener {
    (place: PlaceResult);
}

export interface PlacesListener {
    (places: PlaceResult[], pagination: PlaceSearchPagination);
}
