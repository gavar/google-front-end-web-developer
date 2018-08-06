import {autobind} from "core-decorators";
import React, {ChangeEvent, Component} from "react";
import {Cancel, Search} from "../../icon";
import {Button} from "../../view";
import "./search-box.scss";

export interface SearchBoxProps {
    onChange?(value: string);
}

interface SearchBoxState {
    value: string;
}

export class SearchBox extends Component<SearchBoxProps, SearchBoxState> {

    constructor(props, context) {
        super(props, context);
        this.state = {value: ""};
    }

    render() {
        const {value} = this.state;
        const before = <Button color="clear"
                               className="search-button">
            <Search/>
        </Button>;

        const after = <Button color="clear"
                              className="clear-button"
                              onClick={this.clear}>
            <Cancel/>
        </Button>;

        return <div className="search-box">
            {before}
            <input value={value}
                   onChange={this.onChange}
                   placeholder="Filter places"/>
            {after}
        </div>;
    }

    change(value: string) {
        this.setState({value});
        const {onChange} = this.props;
        if (onChange) onChange(value);
    }

    @autobind
    onChange(e: ChangeEvent<HTMLInputElement>) {
        this.change(e.target.value);
    }

    @autobind
    clear() {
        this.change("");
    }
}
