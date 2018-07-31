import {withDefaultProps} from "$util";
import {autobind} from "core-decorators";
import {Component} from "react";

export interface WithGoogleMapsProps {
    googleKey: string;
    async?: boolean;
    defer?: boolean;
    libraries?: string[];
}

export interface WithGoogleMapsState {
    ready: boolean;
}

@withDefaultProps<WithGoogleMapsProps>({
    async: true,
    defer: true,
    libraries: [],
})
export class GoogleMapsScript extends Component<WithGoogleMapsProps, WithGoogleMapsState> {

    /** @inheritDoc */
    state = {
        ready: false,
    };

    /** @inheritDoc */
    componentDidMount(): void {
        const {async, defer, googleKey, libraries} = this.props;
        const script = document.createElement("script");
        script.async = async;
        script.defer = defer;
        script.onload = this.onLoad;
        script.onerror = this.onError;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleKey}&libraries=${libraries.join(",")}`;
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
        this.setState({ready: true});
    }

    @autobind
    protected onError(e: ErrorEvent) {
        console.error(e);
    }
}
