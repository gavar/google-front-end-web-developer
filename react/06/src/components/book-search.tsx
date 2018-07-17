import React, {ChangeEvent, Component} from "react";
import {Link} from "react-router-dom";
import {bookService} from "../service";
import {Book} from "../types";
import {BookView} from "./book-view";

export interface BookSearchState {
    query: string;
    books: Book[];
}

export class BookSearch extends Component<{}, BookSearchState> {

    state = {
        query: "",
        books: [],
    } as BookSearchState;

    /** @inheritDoc */
    componentWillMount(): void {
        this.onQueryChange = this.onQueryChange.bind(this);
        this.changeBookShelf = this.changeBookShelf.bind(this);
    }

    render() {
        const {books} = this.state;
        return <div className="search-books">
            <div className="search-books-bar">
                <Link to="/" className="close-search"/>
                <div className="search-books-input-wrapper">
                    <input type="text" placeholder="Search by title or author" onChange={this.onQueryChange}/>
                </div>
            </div>
            <div className="search-books-results">
                <ol className="books-grid">
                    {books && books.map(book => (
                        <li key={book.id}>
                            <BookView book={book} changeBookShelf={this.changeBookShelf}/>
                        </li>
                    ))}
                </ol>
            </div>
        </div>;
    }

    async onQueryChange(e: ChangeEvent<HTMLInputElement>) {
        // save query
        const query = e.target.value.trim();
        this.setState({query});

        // query for search results
        const books = await bookService.search(query);

        // modify state if still have same query
        return this.setState(prev => {
            if (prev.query === query)
                return {...prev, books};

            return prev;
        });
    }

    async changeBookShelf(book: Book, shelf: string) {
        if (book.shelf === shelf)
            return;

        // initiate shelf update
        const promise = bookService.setBookShelf(book, shelf);
        this.setState({books: this.state.books});

        // repaint if book reference changed
        const modified = await promise;
        if (modified !== book)
            this.setState({books: this.state.books});

    }
}
