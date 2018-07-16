import React, {Component} from "react";
import {Link} from "react-router-dom";
import * as BooksAPI from "./books-api";
import {Book} from "./types";

export interface BooksListState {
    books?: Book[];
}

export class BookList extends Component<{}, BooksListState> {

    /** @inheritDoc */
    state = {} as BooksListState;

    /** @inheritDoc */
    async componentDidMount() {
        const books = await BooksAPI.getAll();
        this.setState({books});
    }

    /** @inheritDoc */
    render(): React.ReactNode {
        const {books} = this.state;
        const read = books && books.filter(book => book.shelf === "read");
        const reading = books && books.filter(book => book.shelf === "currentlyReading");
        const wantToRead = books && books.filter(book => book.shelf === "wantToRead");

        return <div className="list-books">
            <div className="list-books-title">
                <h1>MyReads</h1>
            </div>
            <div className="list-books-content">
                <div>
                    <Bookshelf title="Currently Reading" books={reading}/>
                    <Bookshelf title="Want to Read" books={wantToRead}/>
                    <Bookshelf title="Read" books={read}/>
                </div>
            </div>
            <div className="open-search">
                <Link to="/search">Add a book</Link>
            </div>
        </div>;
    }
}

export interface BookshelfProps {
    title: string;
    books?: Book[];
}

export function Bookshelf(props: BookshelfProps) {
    const {title, books} = props;
    return <div className="bookshelf">
        <h2 className="bookshelf-title">{title}</h2>
        <div className="bookshelf-books">
            <ol className="books-grid">
                {books && books.map(book => (
                    <li key={book.id}>
                        <BookView book={book}/>
                    </li>
                ))}
            </ol>
        </div>
    </div>;
}

export interface BookViewProps {
    book: Book
}

export function BookView(props: BookViewProps) {
    const {book} = props;
    const {title, authors} = book;
    const {thumbnail} = book.imageLinks;

    return <div className="book">
        <div className="book-top">
            <img className="book-cover" src={thumbnail}/>
            <div className="book-shelf-changer">
                <select>
                    <option value="move" disabled>Move to...</option>
                    <option value="currentlyReading">Currently Reading
                    </option>
                    <option value="wantToRead">Want to Read</option>
                    <option value="read">Read</option>
                    <option value="none">None</option>
                </select>
            </div>
        </div>
        <div className="book-title">{title}</div>
        <div className="book-authors">
            {authors.map(author =>
                <div key={author}>{author}</div>,
            )}
        </div>
    </div>;
}
