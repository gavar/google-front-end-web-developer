import React, {Component} from "react";
import {Link} from "react-router-dom";
import {bookService} from "../service";
import {Book} from "../types";
import {BookView} from "./book-view";

interface BookListState {
    read: Book[];
    wantToRead: Book[];
    currentlyReading: Book[];
}

export class BookList extends Component<{}, BookListState> {

    /** @inheritDoc */
    componentWillMount(): void {
        this.changeBookShelf = this.changeBookShelf.bind(this);
    }

    /** @inheritDoc */
    async componentDidMount() {
        this.updateBooks();
        await bookService.refresh();
        this.updateBooks();
    }

    /** @inheritDoc */
    render(): React.ReactNode {
        // const {read, currentlyReading, wantToRead} = this.state;
        return <div className="list-books">
            <div className="list-books-title">
                <h1>MyReads</h1>
            </div>
            <div className="list-books-content">
                <div>
                    <BookShelf title="Currently Reading"
                               books={bookService.booksOnShelf("currentlyReading")}
                               changeBookShelf={this.changeBookShelf}/>

                    <BookShelf title="Want to Read"
                               books={bookService.booksOnShelf("wantToRead")}
                               changeBookShelf={this.changeBookShelf}/>

                    <BookShelf title="Read"
                               books={bookService.booksOnShelf("read")}
                               changeBookShelf={this.changeBookShelf}/>
                </div>
            </div>
            <div className="open-search">
                <Link to="/search">Add a book</Link>
            </div>
        </div>;
    }

    updateBooks() {
        this.setState({
            read: bookService.booksOnShelf("read") || [],
            wantToRead: bookService.booksOnShelf("wantToRead") || [],
            currentlyReading: bookService.booksOnShelf("currentlyReading") || [],
        });
    }

    async changeBookShelf(book: Book, shelf: string) {
        // initiate books shelf update
        const promise = bookService.setBookShelf(book, shelf);
        // re-render books with locally changed shelf
        this.updateBooks();
        // wait for book shelf update on a server & re-render
        await promise;
        this.updateBooks();
    }
}

export interface BookshelfProps {
    title: string;
    books?: Book[];
    changeBookShelf: (book: Book, shelf: string) => void;
}

export function BookShelf(props: BookshelfProps) {
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

