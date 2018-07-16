import React from "react";
import "./app.css";
import {BookList} from "./book-list";
import {BookSearch} from "./book-search";
import * as BooksAPI from "./books-api";

class BooksApp extends React.Component {

  state = {
    /**
     * TODO: Instead of using this state variable to keep track of which page
     * we're on, use the URL in the browser's address bar. This will ensure that
     * users can use the browser's back and forward buttons to navigate between
     * pages, as well as provide a good URL they can bookmark and share.
     */
    showSearchPage: false,
  };

  /** @inheritDoc */
  componentWillMount(): void {
    this.openSearch = this.openSearch.bind(this);
    this.closeSearch = this.closeSearch.bind(this);
    BooksAPI.getAll().then(console.log);
  }

  render() {
    return (
      <div className="app">
        {this.state.showSearchPage ? (
          <BookSearch close={this.closeSearch}/>
        ) : (
          <BookList openSearch={this.openSearch}/>
        )}
      </div>
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
