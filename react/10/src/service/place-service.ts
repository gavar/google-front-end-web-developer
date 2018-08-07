import {Geocoder, LatLngBounds, LatLngLiteral, Map as GoogleMap} from "$google/maps";
import {
    PlaceDetailsRequest,
    PlaceResult,
    PlaceSearchPagination,
    PlaceSearchRequest,
    PlacesService,
    PlacesServiceStatus,
} from "$google/maps/places";
import {identity} from "$util";
import {autobind} from "core-decorators";
import {store} from "./sql-store";

export class PlaceService {

    /** List of places in memory. */
    public places: Place[] = [];

    /** Dictionary of places in memory by key. */
    public placeByKey: Map<string, Place> = new Map();

    protected geocoder: Geocoder;
    protected placesService: PlacesService;
    protected listeners: PlaceListenerEntry[] = [];
    protected freshPlaces: Set<string> = new Set();

    /**
     * Initialize places service with google map to fetch places from Google API.
     */
    setGoogleMap(map: GoogleMap) {
        this.geocoder = new google.maps.Geocoder();
        this.placesService = new google.maps.places.PlacesService(map);
    }

    /**
     * Fetch place details  by making API call to a Google Service.
     * @param key - place id.
     * @param listener - callback to invoke when request completes.
     */
    async fetchDetails(key: string, listener: PlaceListener): Promise<void> {
        // in memory?
        let place = this.placeByKey.get(key);
        if (place) listener(place);

        // no need to refresh twice
        if (this.freshPlaces.has(key))
            return;

        // save request
        this.listeners.push({key, listener});

        // fetch from remote to refresh data
        const request: PlaceDetailsRequest = {placeId: key};
        this.placesService.getDetails(request, this.onReceiveDetails);

        // use cache while fetching from remote
        place = await store.places.get(key);
        if (place) this.notify(place, false);
    }

    /**
     * Search for nearby places in cached places.
     * @param bounds - bounds within which to search for a places.
     * @param listener - callback to invoke when search completes.
     */
    async nearbySearchCache(bounds: LatLngBounds, listener: PlacesListener): Promise<void> {
        const query = store.places.filter(place => isWithinBounds(bounds, place));
        const places = await query.toArray();

        // save cache places to memory
        for (const place of places) this.placeByKey.set(place.key, place);
        this.updatePlaceList();

        // notify with places from cache
        listener(places);
    }

    /**
     * Search for nearby places by making API call to a Google Service.
     * @param bounds - bounds within which to search for a places.
     * @param listener - callback to invoke when search completes.
     */
    async nearbySearchRemote(bounds: LatLngBounds, listener: PlacesListener): Promise<void> {

        // request places from server
        const self = this;
        const request: PlaceSearchRequest = {bounds, type: "car_wash"};
        this.placesService.nearbySearch(request, callback);

        async function callback(results: PlaceResult[], status: PlacesServiceStatus, pagination: PlaceSearchPagination) {
            const {OK, ZERO_RESULTS} = google.maps.places.PlacesServiceStatus;
            switch (status) {
                case OK:
                    // fetch next page
                    if (pagination.hasNextPage)
                        pagination.nextPage();

                    // merge places data with existing
                    const promises = results.map(self.nearbyPlace, self);
                    const places = await Promise.all(promises);
                    await self.savePlaces.apply(self, places);

                    // notify
                    listener(places);
                    break;

                case ZERO_RESULTS:
                    break;

                default:
                    console.error(status, ":", results);
                    break;
            }
        }
    }

    @autobind
    protected async onReceiveDetails(result: PlaceResult, status: PlacesServiceStatus) {
        const {OK} = google.maps.places.PlacesServiceStatus;
        switch (status) {
            case OK:
                const place = await this.savePlaceDetails(result);
                this.notify(place, true);
                break;

            default:
                console.error(status, ":", result);
                break;
        }
    }

    protected async nearbyPlace(result: PlaceResult): Promise<Place> {
        let place = asPlace(result);
        let existing = await store.places.get(place.key);
        place = {...existing, ...place};
        return place;
    }

    protected async savePlaceDetails(result: PlaceResult): Promise<Place> {
        const place = asPlaceDetails(result);
        this.freshPlaces.add(place.key);
        await this.savePlaces(place);
        return place;
    }

    protected async savePlaces(...places: Place[]) {
        // save to memory
        for (const place of places)
            this.placeByKey.set(place.key, place);

        // update places list
        this.updatePlaceList();

        // save to store
        await store.places.bulkPut(places);

        // limit by 1000 places, keeping most recently updated
        await store.places
            .orderBy("updateTime")
            .reverse()
            .offset(1000)
            .delete();
    }

    protected updatePlaceList() {
        this.places = Array.from(this.placeByKey.values());
    }

    protected notify(place: Place, evict: boolean) {
        const {key} = place;
        const items = this.listeners;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.key !== key) continue;
            if (evict) items[i] = null;
            item.listener(place);
        }
        this.listeners = items.filter(identity);
    }
}

export interface PlaceListenerEntry {
    key: string;
    listener: PlaceListener;
}

export interface PlaceListener {
    (place: Place);
}

export interface PlacesListener {
    (places: Place[]);
}

export interface Place {
    key: string;
    icon: string;
    name: string;
    phone: string;
    rating: number;
    website: string;
    vicinity: string;
    location: LatLngLiteral;
    operating: boolean;

    updateTime: number;
    details?: boolean;
}

function asPlace(item: PlaceResult): Place {
    const {geometry} = item;
    const place: Place = {
        key: item.place_id,
        name: item.name,
        icon: item.icon,
        phone: item.international_phone_number,
        rating: item.rating,
        website: item.website,
        vicinity: item.vicinity,
        operating: !item.permanently_closed,
        location: geometry.location.toJSON(),
        updateTime: Date.now(),
    };
    // remove undefined keys
    return JSON.parse(JSON.stringify(place));
}

function asPlaceDetails(item: PlaceResult): Place {
    const place = asPlace(item);
    place.details = true;
    return place;
}

function isWithinBounds(bounds: LatLngBounds, place: Place): boolean {
    return bounds.contains(place.location);
}
