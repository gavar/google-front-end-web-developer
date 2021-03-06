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
import {identity} from "$util";
import * as fq from "./foursquare";
import {Address, FourSquarePlace, Place} from "./place";
import {store} from "./sql-store";

const DEBUG = process.env.NODE_ENV !== "production";

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
    protected saveLock: Promise<any>;
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
        if (place) listener(key, place, "memory");

        // no need to refresh twice
        if (this.placesWithDetails.has(key))
            return;

        // save request
        this.listeners.push({
            key,
            listener,
            waits: new Set<PlaceSource>([
                "cache",
                "google",
                "foursquare",
            ]),
        });

        // already requesting?
        if (this.placeDetailsRequests.has(key))
            return;

        // use cache while fetching from remote
        place = await store.places.get(key);
        if (place) {
            this.savePlaceToMemory(place);
            this.notifyPlaceListener(key, "cache");
        }

        // fetch from remote to refresh data
        this.placeDetailsRequests.add(key);
        const request: PlaceDetailsRequest = {placeId: key, fields: detailsFields};
        const callback = (result, status) => this.onReceiveDetails(key, result, status);
        try { this.placesService.getDetails(request, callback); }
        catch (e) { callback(null, google.maps.places.PlacesServiceStatus.ERROR); }

        // fetch FourSquare data
        if (place)
            this.fetchFoursquare(key, place);
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
        this.updateNearbyPlaces();

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
            const {
                OK,
                NOT_FOUND,
                ZERO_RESULTS,
                REQUEST_DENIED,
                OVER_QUERY_LIMIT,
            } = google.maps.places.PlacesServiceStatus;

            switch (status) {
                case OK:
                    // fetch next page
                    if (pagination.hasNextPage)
                        pagination.nextPage();

                    // merge places data with existing
                    const promises = results.map(self.fromNearbyPlace, self);
                    const places = await Promise.all(promises);
                    self.savePlace.apply(self, places);
                    self.updateNearbyPlaces();

                    // notify
                    listener(places);
                    break;

                case NOT_FOUND:
                case REQUEST_DENIED:
                case ZERO_RESULTS:
                case OVER_QUERY_LIMIT:
                    if (DEBUG) console.log(status, ":", results);
                    break;

                default:
                    if (DEBUG) console.error(status, ":", results);
                    break;
            }
        }
    }

    protected async fetchFoursquare(key: string, place: Place) {
        let {foursquare} = place;

        // fetch foursquare venue
        if (!foursquare) {
            try {
                let {name, location} = place;
                const {lat, lng} = location;
                const {meta, body} = await fq.search(name, lat, lng);
                switch (meta.code) {
                    case 200:
                        const {venues} = body;
                        const venue = venues && venues[0];
                        if (venue) {
                            foursquare = {
                                found: true,
                                venue: venue.id,
                            };
                        }
                        else {
                            foursquare = {
                                found: false,
                            };
                        }
                        break;
                    default:
                        if (DEBUG) console.log(meta);
                        break;
                }
            }
            catch (e) {
                if (DEBUG) console.error(e);
            }
        }

        // fetch foursquare likes by venue id
        const venue = foursquare && foursquare.venue;
        if (venue) {
            try {
                const {meta, body} = await fq.likes(venue);
                switch (meta.code) {
                    case 200:
                        foursquare.likes = body.likes.count;
                        break;
                    default:
                        if (DEBUG) console.log(meta);
                        break;
                }
            }
            catch (e) {
                if (DEBUG) console.error(e);
            }
        }

        // update
        place = await this.withFourSquarePlace(key, foursquare);
        this.savePlace(place);
        this.notifyPlaceListener(key, "foursquare");
    }

    protected async onReceiveDetails(key: string, result: PlaceResult, status: PlacesServiceStatus) {
        this.placeDetailsRequests.delete(key);
        const {
            OK,
            NOT_FOUND,
            ZERO_RESULTS,
            REQUEST_DENIED,
            OVER_QUERY_LIMIT,
        } = google.maps.places.PlacesServiceStatus;

        switch (status) {
            case OK:
                const place = await this.fromDetails(key, result);
                this.placesWithDetails.add(key);
                this.savePlace(place);
                break;

            case NOT_FOUND:
            case REQUEST_DENIED:
            case ZERO_RESULTS:
            case OVER_QUERY_LIMIT:
                if (DEBUG) console.log(status, ":", result);
                break;

            default:
                if (DEBUG) console.error(status, ":", result);
                break;
        }

        this.notifyPlaceListener(key, "google");
    }

    protected async savePlace(...places: Place[]) {
        this.savePlaceToMemory.apply(this, places);
        // wait for previous save to complete
        await this.saveLock;
        // save places
        const lock = this.saveLock = this.savePlaceToStore.apply(this, places);
        await lock;
    }

    protected async savePlaceToStore(...places: Place[]) {
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
        let update = false;

        // update index
        for (const place of places) {
            const {key} = place;
            update = update || place !== this.placeByKey.get(key);
            this.placeByKey.set(place.key, place);
        }

        // update places lists
        if (update)
            this.places = Array.from(this.placeByKey.values());
    }

    protected updateNearbyPlaces() {
        this.nearbyPlaces = this.places.filter(isWithinBounds, this.nearbyBounds);
    }

    protected notifyPlaceListener(key: string, source: PlaceSource) {
        const place = this.placeByKey.get(key);
        const items = this.listeners;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item === null) continue;
            if (item.key !== key) continue;

            // waits for source?
            const {waits, listener} = item;
            if (!waits.has(source)) continue;

            // evict?
            waits.delete(source);
            if (waits.size <= 0)
                items[i] = null;

            // invoke
            listener(key, place, source);
        }
        this.listeners = items.filter(identity);
    }

    async fromDetails(key: string, googlePlace: PlaceResult): Promise<Place> {
        const place = await this.withGooglePlace(key, googlePlace);
        place.detailed = true;
        return place;
    }

    async fromNearbyPlace(googlePlace: PlaceResult): Promise<Place> {
        return await this.withGooglePlace(googlePlace.place_id, googlePlace);
    }

    async getPlaceByKey(key: string): Promise<Place> {
        let place = this.placeByKey.get(key);
        if (place == null) place = await store.places.get(key);
        return place;
    }

    async withGooglePlace(key: string, googlePlace: PlaceResult): Promise<Place> {
        const now = await this.getPlaceByKey(key) || {key} as Place;
        Object.assign(now, fromGooglePlace(googlePlace, key));
        return now;
    }

    async withFourSquarePlace(key: string, foursquarePlace: FourSquarePlace): Promise<Place> {
        const now = await this.getPlaceByKey(key) || {key} as Place;
        if (now.foursquare) Object.assign(now.foursquare, foursquarePlace);
        else now.foursquare = foursquarePlace;
        return now;
    }
}

export type PlaceSource =
    | "memory"
    | "cache"
    | "google"
    | "foursquare"
    ;

export interface PlaceListenerEntry {
    key: string;
    waits: Set<PlaceSource>;
    listener: PlaceListener;
}

export interface PlaceListener {
    (key: string, place: Place, source: PlaceSource);
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

function fromGooglePlace(item: PlaceResult, key?: string): Place {
    const {photos, geometry, reviews, address_components} = item;
    const place: Place = {
        key: key || item.place_id || void 0,
        name: item.name,
        icon: item.icon,
        phone: item.international_phone_number,
        photo: photos && photos[0] && photos[0].getUrl(photoOptions) || void 0,
        rating: item.rating,
        reviews: reviews && reviews.length || void 0,
        website: item.website,
        address: address(address_components, item.vicinity) || void 0,
        vicinity: item.vicinity,
        operating: !item.permanently_closed,
        location: geometry && geometry.location.toJSON() || void 0,
        updateTime: Date.now(),
    };
    // remove undefined keys
    return JSON.parse(JSON.stringify(place));
}

function address(components: GeocoderAddressComponent[], vicinity: string): Address {
    return components && addressByComponents(components)
        // || vicinity && addressByVicinity(vicinity)
        || void 0;
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
    if (Object.keys(value).length > 0)
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
