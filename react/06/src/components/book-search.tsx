import React, {ChangeEvent, Component} from "react";
import {Link} from "react-router-dom";
import * as BooksAPI from "../books-api";
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

        // clear books if empty search
        if (!query.length)
            return this.setState({books: []});

        try {
            // query for search results
            const books = await BooksAPI.search(query);

            // clear books if error
            if (books.error) {
                console.log(books);
                return this.setState({books: []});
            }

            // modify state if still have same query
            return this.setState(prev => {
                if (prev.query === query)
                    return {...prev, books};

                return prev;
            });
        }
        catch (e) {
            // clear books if error
            this.setState({books: []});
            console.error(e);
        }
    }

    async changeBookShelf(book: Book, shelf: string) {
        // check if really changed
        if (shelf === book.shelf)
            return;

        // update book shelf locally
        book.shelf = shelf;

        // update book shelf on a server
        await BooksAPI.update(book, shelf);
    }
}
