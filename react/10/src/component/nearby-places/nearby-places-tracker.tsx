import {MapsEventListener} from "$google/maps";
import {withContextProps} from "$util";
import {autobind} from "core-decorators";
import {PureComponent} from "react";
import {ApplicationContext, ApplicationContextProps} from "../../context";
import {Place, PlaceService} from "../../service";

function contextToProps(props: ApplicationContextProps): Partial<NearbyPlacesProps> {
    const {map, placeService} = props;
    return {map, placeService};
}

export interface NearbyPlacesProps {
    map?: google.maps.Map,
    placeService?: PlaceService;
    onNearbyPlacesChanged?(places: Place[]);
}

@withContextProps(ApplicationContext, contextToProps)
export class NearbyPlacesTracker extends PureComponent<NearbyPlacesProps> {

    protected alive: boolean = true;
    protected lastMoveTime: number = 0;
    protected scheduleNearbySearchByBoundsCache: boolean;
    protected scheduleNearbySearchByBoundsRemote: boolean;
    protected readonly listeners: MapsEventListener[] = [];

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

    protected searchNearbyByBounds(cache: boolean) {
        const {map} = this.props;
        const bounds = map.getBounds();
        if (!bounds) return;

        const {placeService} = this.props;
        if (cache) {
            this.scheduleNearbySearchByBoundsCache = false;
            placeService.nearbySearchCache(bounds, this.onNearbySearch);
        }
        else {
            this.scheduleNearbySearchByBoundsRemote = false;
            placeService.nearbySearchRemote(bounds, this.onNearbySearch);
        }
    }

    protected update() {
        const now = Date.now();

        // wait for 10 frames before start fetching new places from cache
        if (this.scheduleNearbySearchByBoundsCache)
            if (now - this.lastMoveTime >= 10 / 60)
                this.searchNearbyByBounds(true);

        // wait for 1 sec before start fetching new places from remote
        if (this.scheduleNearbySearchByBoundsRemote)
            if (now - this.lastMoveTime >= 1000)
                this.searchNearbyByBounds(false);
    }

    @autobind
    protected onNearbySearch() {
        // notify places update
        const {placeService, onNearbyPlacesChanged} = this.props;
        if (onNearbyPlacesChanged) {
            let {nearbyPlaces} = placeService;
            nearbyPlaces = nearbyPlaces.filter(isOperating);
            nearbyPlaces.sort(sortByKey);
            onNearbyPlacesChanged(nearbyPlaces);
        }
    }

    @autobind
    protected onBoundsChanged() {
        const {placeService} = this.props;
        const {places} = placeService;

        this.lastMoveTime = Date.now();
        this.scheduleNearbySearchByBoundsCache = true;
        this.scheduleNearbySearchByBoundsRemote = true;

        if (places.length < 1)
            return this.searchNearbyByBounds(false);
    }
}

function isOperating(place: Place) {
    return place.operating;
}

function sortByKey(a: Place, b: Place) {
    if (a.key > b.key) return 1;
    if (a.key < b.key) return 1;
    return 0;
}
