import {Geocoder, GeocoderAddressComponent, LatLngBounds, Map as GoogleMap} from "$google/maps";
import {
    PhotoOptions,
    PlaceDetailsRequest,
    PlaceResult,
    PlaceSearchPagination,
    PlaceSearchRequest,
    PlacesService,
    PlacesServiceStatus,
} from "$google/maps/places";
import {hasOwnProperty, identity} from "$util";
import {Address, Place} from "./place";
import {store} from "./sql-store";

const EmptyPlace = {address: {}} as Place;

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
    protected placesWithDetails: Set<string> = new Set();
    protected placeDetailsRequests: Set<string> = new Set();

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
        if (this.placesWithDetails.has(key))
            return;

        // save request
        this.listeners.push({key, listener});

        // already requested?
        if (this.placeDetailsRequests.has(key))
            return;

        // fetch from remote to refresh data
        const request: PlaceDetailsRequest = {
            placeId: key,
            fields: detailsFields,
        };
        this.placeDetailsRequests.add(key);
        this.placesService.getDetails(request, (result, status) => {
            return this.onReceiveDetails(key, result, status);
        });

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
                    const promises = results.map(self.fromNearbyPlace, self);
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

    protected async onReceiveDetails(key: string, result: PlaceResult, status: PlacesServiceStatus) {
        this.placeDetailsRequests.delete(key);
        const {OK} = google.maps.places.PlacesServiceStatus;
        switch (status) {
            case OK:
                const place = await this.fromPlaceDetails(key, result);
                this.placesWithDetails.add(place.key);
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

    async fromPlaceDetails(key: string, result: PlaceResult): Promise<Place> {
        const place = await this.fromPlace(key, result);
        place.detailed = true;
        return place;
    }

    fromNearbyPlace(result: PlaceResult): Promise<Place> {
        return this.fromPlace(result.place_id, result);
    }

    async fromPlace(key: string, result: PlaceResult) {
        let place = convertToPlace(result, key);
        let existing = this.placeByKey.get(key) || await store.places.get(key) || EmptyPlace;
        place = {...existing, ...place};
        place.address = {...existing.address, ...place.address};
        return place;
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

const detailsFields = [
    // "place_id", // extracted from request
    // "name", // provided by NearbySearch
    // "icon", // provided by NearbySearch
    // "rating", // provided by NearbySearch
    "reviews",
    "website",
    // "vicinity", // provided by NearbySearch
    // "geometry/location", // provided by NearbySearch
    "permanently_closed",
    "address_components",
    "international_phone_number",
];

const photoOptions: PhotoOptions = {
    maxWidth: 100,
    maxHeight: 100,
};

function convertToPlace(item: PlaceResult, key?: string): Place {
    const {photos, geometry, reviews, address_components} = item;
    const place: Place = {
        key: key || item.place_id || void 0,
        name: item.name,
        icon: item.icon,
        phone: item.international_phone_number,
        photo: photos && photos[0] && photos[0].getUrl(photoOptions),
        rating: item.rating,
        reviews: reviews && reviews.length || void 0,
        website: item.website,
        address: address(address_components, item.vicinity),
        vicinity: item.vicinity,
        operating: !item.permanently_closed,
        location: geometry && geometry.location.toJSON(),
        updateTime: Date.now(),
    };
    // remove undefined keys
    return JSON.parse(JSON.stringify(place));
}

function address(components: GeocoderAddressComponent[], vicinity: string): Address {
    return components && addressByComponents(components)
        // || vicinity && addressByVicinity(vicinity)
        || null;
}

function addressByComponents(components: GeocoderAddressComponent[]): Address {
    const country = findComponentWithType(components, "country");
    const city = findComponentWithType(components, "locality");
    const street = findComponentWithType(components, "route");
    const number = findComponentWithType(components, "street_number");

    const value: Address = {};
    if (country) value.country = country.long_name;
    if (city) value.city = city.long_name;
    if (street) {
        if (number) value.street = `${street.long_name} ${number.long_name}`;
        else value.street = street.long_name;
    }

    // check if any key set
    if (hasOwnProperty(value))
        return value;
}

function addressByVicinity(vicinity: string): Address {
    const parts = vicinity.split(",");
    // last part is always city
    const city = parts[parts.length - 1];
    // may accidentally include postal code
    const street = Number(parts[0]) ? parts[1] : parts[0];
    return {
        city,
        street,
    };
}

function findComponentWithType(components: GeocoderAddressComponent[], type: string): GeocoderAddressComponent {
    if (components)
        for (const component of components)
            if (component.types.includes(type))
                return component;
}

function isWithinBounds(this: LatLngBounds, place: Place): boolean {
    return this.contains(place.location);
}

// shared service instance.
export const $PlaceService = new PlaceService();
