import React, {Component} from "react";
import {Link} from "react-router-dom";
import * as BooksAPI from "../books-api";
import {Book} from "../types";
import {BookShelfChanger} from "./book-shelf-changer";

export interface BookListProps {
    read: Book[];
    wantToRead: Book[];
    currentlyReading: Book[];
}

export class BookList extends Component<{}, BookListProps> {

    /** @inheritDoc */
    state = {
        read: [],
        wantToRead: [],
        currentlyReading: [],
    };

    /** @inheritDoc */
    componentWillMount(): void {
        this.changeBookShelf = this.changeBookShelf.bind(this);
    }

    /** @inheritDoc */
    componentDidMount() {
        return this.fetchBooks();
    }

    async fetchBooks() {
        const books = await BooksAPI.getAll();
        this.setState({
            read: books.filter(book => book.shelf === "read"),
            wantToRead: books.filter(book => book.shelf === "wantToRead"),
            currentlyReading: books.filter(book => book.shelf === "currentlyReading"),
        });
    }

    /** @inheritDoc */
    render(): React.ReactNode {
        const {read, currentlyReading, wantToRead} = this.state;
        return <div className="list-books">
            <div className="list-books-title">
                <h1>MyReads</h1>
            </div>
            <div className="list-books-content">
                <div>
                    <Bookshelf title="Currently Reading"
                               books={currentlyReading}
                               changeBookShelf={this.changeBookShelf}/>

                    <Bookshelf title="Want to Read"
                               books={wantToRead}
                               changeBookShelf={this.changeBookShelf}/>

                    <Bookshelf title="Read"
                               books={read}
                               changeBookShelf={this.changeBookShelf}/>
                </div>
            </div>
            <div className="open-search">
                <Link to="/search">Add a book</Link>
            </div>
        </div>;
    }

    async changeBookShelf(book: Book, shelf: string) {
        // check if really changed
        if (shelf === book.shelf)
            return;

        // update state without waiting response
        this.setState(state => {
            // remove from current shelf
            const prev: Book[] = state[book.shelf];
            const index = prev.indexOf(book);
            prev.splice(index, 1);

            // place on new shelf
            const active: Book[] = state[shelf];
            active.push(book);
            book.shelf = shelf;

            return state;
        });

        try {
            // update book shelf on a server
            await BooksAPI.update(book, shelf);
        }
        catch (e) {
            // re-fetch all books if error
            console.error(e);
            await this.fetchBooks();
        }

    }
}

export interface BookshelfProps {
    title: string;
    books?: Book[];
    changeBookShelf: (book: Book, shelf: string) => void;
}

export function Bookshelf(props: BookshelfProps) {
    const {title, books, changeBookShelf} = props;
    return <div className="bookshelf">
        <h2 className="bookshelf-title">{title}</h2>
        <div className="bookshelf-books">
            <ol className="books-grid">
                {books && books.map(book => (
                    <li key={book.id}>
                        <BookView book={book} changeBookShelf={changeBookShelf}/>
                    </li>
                ))}
            </ol>
        </div>
    </div>;
}

export interface BookViewProps {
    book: Book;
    changeBookShelf: (book: Book, shelf: string) => void;
}

export function BookView(props: BookViewProps) {
    const {book, changeBookShelf} = props;
    const {title, authors} = book;
    const {thumbnail} = book.imageLinks;

    return <div className="book">
        <div className="book-top">
            <img className="book-cover" src={thumbnail}/>
            <BookShelfChanger book={book} changeBookShelf={changeBookShelf}/>
        </div>
        <div className="book-title">{title}</div>
        <div className="book-authors">
            {authors.map(author =>
                <div key={author}>{author}</div>,
            )}
        </div>
    </div>;
}
