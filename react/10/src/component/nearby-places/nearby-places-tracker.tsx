import {MapsEventListener} from "$google/maps";
import {PlaceResult, PlaceSearchPagination} from "$google/maps/places";
import {withContextProps} from "$util";
import {autobind} from "core-decorators";
import {PureComponent} from "react";
import {ApplicationContext, ApplicationContextProps} from "../../context";
import {PlaceService} from "../../service";

function contextToProps(props: ApplicationContextProps): Partial<NearbyPlacesProps> {
    const {map, placeService} = props;
    return {map, placeService};
}

export interface NearbyPlacesProps {
    map: google.maps.Map,
    placeService?: PlaceService;
    onPlacesUpdate?(places: PlaceResult[]): void;
}

@withContextProps(ApplicationContext, contextToProps)
export class NearbyPlacesTracker extends PureComponent<NearbyPlacesProps> {

    protected alive: boolean = true;
    protected lastMoveTime: number = 0;
    protected scheduleNearbySearchByBounds: boolean;

    protected readonly listeners: MapsEventListener[] = [];
    protected readonly placeByID: Map<string, PlaceResult> = new Map<string, PlaceResult>();

    /** @inheritDoc */
    componentDidMount(): void {
        const {map} = this.props;
        this.listeners.push(
            map.addListener("bounds_changed", this.onBoundsChanged),
        );

        const frame: FrameRequestCallback = () => {
            if (!this.alive) return;
            this.update();
            window.requestAnimationFrame(frame);
        };
        window.requestAnimationFrame(frame);
    }

    /** @inheritDoc */
    render() {
        return null;
    }

    /** @inheritDoc */
    componentWillUnmount(): void {
        this.alive = false;
        for (const listener of this.listeners)
            listener.remove();
        this.listeners.length = 0;
    }

    protected searchNearbyByBounds() {
        const {map} = this.props;
        const bounds = map.getBounds();
        if (!bounds) return;

        const {placeService} = this.props;
        this.scheduleNearbySearchByBounds = false;
        placeService.nearbySearch({
            bounds,
            type: "car_wash",
        }, this.onNearbySearchResults);
    }

    protected update() {
        const now = Date.now();
        // wait for 1 sec before start fetching new places
        if (this.scheduleNearbySearchByBounds)
            if (now - this.lastMoveTime >= 1000)
                this.searchNearbyByBounds();
    }

    @autobind
    protected onNearbySearchResults(places: PlaceResult[], pagination: PlaceSearchPagination) {
        // cache places
        const placeByID = this.placeByID;
        for (const place of places)
            placeByID.set(place.place_id, place);

        // fetch next page if exists
        if (pagination.hasNextPage)
            pagination.nextPage();

        // notify places update
        const {onPlacesUpdate} = this.props;
        if (onPlacesUpdate) {
            let items = Array.from(placeByID.values());
            items = items.filter(isOperating);
            items.sort(sortByPlaceID);
            onPlacesUpdate(items);
        }
    }

    @autobind
    protected onBoundsChanged() {
        this.lastMoveTime = Date.now();
        this.scheduleNearbySearchByBounds = true;
        if (this.placeByID.size < 1)
            return this.searchNearbyByBounds();
    }
}

function isOperating(place: PlaceResult) {
    return !place.permanently_closed;
}

function sortByPlaceID(a: PlaceResult, b: PlaceResult) {
    if (a.place_id > b.place_id) return 1;
    if (a.place_id < b.place_id) return 1;
    return 0;
}
