import {Map, MapsEventListener} from "$google/maps";
import {autobind} from "core-decorators";
import {PureComponent} from "react";
import {Place, placeService} from "../../service";

export interface NearbyPlacesProps {
    map: Map,
    onNearbyPlacesChanged?(places: Place[]);
}

export class NearbyPlacesTracker extends PureComponent<NearbyPlacesProps> {

    protected scheduled: boolean;
    protected lastMoveTime: number = 0;
    protected scheduleNearbySearchByBoundsCache: boolean;
    protected scheduleNearbySearchByBoundsRemote: boolean;
    protected readonly listeners: MapsEventListener[] = [];

    /** @inheritDoc */
    componentDidMount(): void {
        const {map} = this.props;
        this.scheduleUpdate();
        this.listeners.push(
            map.addListener("bounds_changed", this.onBoundsChanged),
        );
    }

    /** @inheritDoc */
    render() {
        return "";
    }

    /** @inheritDoc */
    componentWillUnmount(): void {
        for (const listener of this.listeners)
            listener.remove();
        this.listeners.length = 0;
    }

    protected searchNearbyByBounds(cache: boolean) {
        const {map} = this.props;
        const bounds = map.getBounds();
        if (!bounds) return;

        if (cache) {
            this.scheduleNearbySearchByBoundsCache = false;
            placeService.nearbySearchCache(bounds, this.onNearbySearchDone);
        }
        else {
            this.scheduleNearbySearchByBoundsRemote = false;
            placeService.nearbySearchRemote(bounds, this.onNearbySearchDone);
        }
    }

    @autobind
    protected update() {
        this.scheduled = false;
        const now = Date.now();

        // wait for 1 sec before start fetching new places from cache
        if (this.scheduleNearbySearchByBoundsCache)
            if (now - this.lastMoveTime >= 1000)
                this.searchNearbyByBounds(true);

        // wait for 1.5 sec before start fetching new places from remote
        if (this.scheduleNearbySearchByBoundsRemote)
            if (now - this.lastMoveTime >= 1500)
                this.searchNearbyByBounds(false);

        // re-schedule?
        if (this.scheduleNearbySearchByBoundsCache || this.scheduleNearbySearchByBoundsRemote)
            this.scheduleUpdate();
    }

    protected scheduleUpdate() {
        // already scheduled?
        if (this.scheduled)
            return;

        // schedule another check in 500 ms
        if (this.scheduleNearbySearchByBoundsCache || this.scheduleNearbySearchByBoundsRemote) {
            this.scheduled = true;
            setTimeout(this.update, 500);
        }
    }

    @autobind
    protected onNearbySearchDone() {
        // notify places update
        const {onNearbyPlacesChanged} = this.props;
        if (onNearbyPlacesChanged) {
            let {nearbyPlaces} = placeService;
            onNearbyPlacesChanged(nearbyPlaces);
        }
    }

    @autobind
    protected onBoundsChanged() {
        this.lastMoveTime = Date.now();
        this.scheduleNearbySearchByBoundsCache = true;
        this.scheduleNearbySearchByBoundsRemote = true;
        this.scheduleUpdate();
    }
}
