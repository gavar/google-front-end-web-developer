import {Geocoder, LatLngBounds, Map as GoogleMap} from "$google/maps";
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
import {Place} from "./place";
import {store} from "./sql-store";

export class PlaceService {

    /** List of places in memory. */
    public places: Place[] = [];

    /** Dictionary of places in memory by key. */
    public placeByKey: Map<string, Place> = new Map();

    /** List of nearby places within {@link nearbyBounds}. */
    public nearbyPlaces: Place[] = [];

    /** Bounds within which nearby places are filtered. */
    public nearbyBounds: LatLngBounds;

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
        if (place) {
            this.savePlaceToMemory(place);
            this.notify(place, false);
        }
    }

    /**
     * Search for nearby places in cached places.
     * @param bounds - bounds within which to search for a places.
     * @param listener - callback to invoke when search completes.
     */
    async nearbySearchCache(bounds: LatLngBounds, listener: PlacesListener): Promise<void> {
        // save bounds for future use
        this.nearbyBounds = bounds;
        
        const query = store.places.filter(isWithinBounds.bind(bounds));
        const places = await query.toArray();

        // save cache places to memory
        this.savePlaceToMemory.apply(this, places);

        // notify with places from cache
        listener(places);
    }

    /**
     * Search for nearby places by making API call to a Google Service.
     * @param bounds - bounds within which to search for a places.
     * @param listener - callback to invoke when search completes.
     */
    async nearbySearchRemote(bounds: LatLngBounds, listener: PlacesListener): Promise<void> {
        // save bounds for future use
        this.nearbyBounds = bounds;

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
                    const promises = results.map(fromNearbyPlace);
                    const places = await Promise.all(promises);
                    await self.savePlace.apply(self, places);

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
                const place = fromPlaceDetails(result);
                this.freshPlaces.add(place.key);
                await this.savePlace(place);
                this.notify(place, true);
                break;

            default:
                console.error(status, ":", result);
                break;
        }
    }

    protected async savePlace(...places: Place[]) {
        // save to memory
        this.savePlaceToMemory.apply(this, places);

        // save to store
        await store.places.bulkPut(places);

        // limit by 1000 places, keeping most recently updated
        await store.places
            .orderBy("updateTime")
            .reverse()
            .offset(1000)
            .delete();
    }

    protected savePlaceToMemory(...places: Place[]) {
        // update index
        for (const place of places)
            this.placeByKey.set(place.key, place);

        // update places lists
        this.places = Array.from(this.placeByKey.values());
        this.nearbyPlaces = this.places.filter(isWithinBounds, this.nearbyBounds);
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

function fromPlaceDetails(item: PlaceResult): Place {
    const place = asPlace(item);
    place.details = true;
    return place;
}

async function fromNearbyPlace(result: PlaceResult): Promise<Place> {
    let place = asPlace(result);
    let existing = await store.places.get(place.key);
    place = {...existing, ...place};
    return place;
}

function isWithinBounds(this: LatLngBounds, place: Place): boolean {
    return this.contains(place.location);
}
