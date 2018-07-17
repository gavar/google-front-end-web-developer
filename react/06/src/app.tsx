import React from "react";
import {HashRouter, Route} from "react-router-dom";
import "./app.css";
import {BookList, BookSearch} from "./components";

class BooksApp extends React.Component {

    /** @inheritDoc */
    componentWillMount(): void {
        this.openSearch = this.openSearch.bind(this);
        this.closeSearch = this.closeSearch.bind(this);
    }

    render() {
        return (
            <HashRouter>
                <main className={"app"}>
                    <Route path={"/search"} component={BookSearch}/>
                    <Route exact path={"/"} component={BookList}/>
                </main>
            </HashRouter>
        );
    }

    openSearch() {
        this.setState({showSearchPage: true});
    }

    closeSearch() {
        this.setState({showSearchPage: false});
    }
}

export default BooksApp;
