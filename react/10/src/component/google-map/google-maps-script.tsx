import {identity} from "$util";
import {autobind} from "core-decorators";
import {Component} from "react";

export interface WithGoogleMapsProps {
    googleKey: string;
    version?: string,
    async?: boolean;
    defer?: boolean;
    libraries?: string[];
}

export interface WithGoogleMapsState {
    ready: boolean;
}

export class GoogleMapsScript extends Component<WithGoogleMapsProps, WithGoogleMapsState> {

    static readonly defaultProps: Partial<WithGoogleMapsProps> = {
        async: true,
        defer: true,
        libraries: [],
    };

    /** @inheritDoc */
    state = {
        ready: false,
    };

    /** @inheritDoc */
    componentDidMount(): void {
        const {async, defer, googleKey, version, libraries} = this.props;
        const script = document.createElement("script");
        script.async = async;
        script.defer = defer;
        script.onload = this.onLoad;
        script.onerror = this.onError;

        const query = [
            version && `v=${version}`,
            googleKey && `key=${googleKey}`,
            libraries && libraries.length && `libraries=${libraries.join(",")}`,
        ].filter(identity);

        script.src = `https://maps.googleapis.com/maps/api/js?${query.join("&")}`;
        document.head.appendChild(script);
    }

    /** @inheritDoc */
    render() {
        const {ready} = this.state;
        const {children} = this.props;

        if (ready) return children;
        return null;
    }

    @autobind
    protected onLoad(e: Event) {
        applyMarkerFix();
        this.setState({ready: true});
    }

    @autobind
    protected onError(e: ErrorEvent) {
        console.error(e);
    }
}

function applyMarkerFix() {
    const Marker = google.maps.Marker;
    const patch = (onRemove) => {
        return function onRemovePatched(...args) {
            let temp = document.createElement("div");
            if (!this.labelDiv_.parentNode) temp.appendChild(this.labelDiv_);
            if (!this.eventDiv_.parentNode) temp.appendChild(this.eventDiv_);
            if (!this.listeners_) this.listeners_ = [];
            onRemove.call(this, ...args);
            temp = null;
        };
    };

    Marker.prototype.setMap = (setMap => {
        return function setMapPatched(...args) {
            if (this.label) {
                const proto = Object.getPrototypeOf(this.label);
                proto.onRemove = patch(proto.onRemove);
            }
            setMap.call(this, ...args);
        };
    })(Marker.prototype.setMap);
}
