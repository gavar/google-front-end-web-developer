import {autobind} from "core-decorators";
import React, {ChangeEvent, PureComponent} from "react";
import {Cancel, Search} from "../../icon";
import {Button} from "../../view";
import "./search-box.scss";

export interface SearchBoxProps {
    onChange?(value: string);
}

interface SearchBoxState {
    value: string;
}

export class SearchBox extends PureComponent<SearchBoxProps, SearchBoxState> {

    constructor(props, context) {
        super(props, context);
        this.state = {value: ""};
    }

    render() {
        const {value} = this.state;

        return <div className="search-box">
            <div className="search-box-container">

                <div className="search-box-input">
                    <input value={value}
                           onChange={this.onChange}
                           placeholder="Search for car wash nearby..."/>
                    <Search/>
                </div>
                <Button variant="text"
                        className="clear-button"
                        onClick={this.clear}>
                    <Cancel/>
                </Button>
            </div>
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
