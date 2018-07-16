import * as BooksAPI from "../books-api";
import {Book} from "../types";

export class BookService {
    private books: Book[];

    /** Lazily fetch user books if not yet fetched. */
    async fetch(): Promise<Book[]> {
        return this.books ? this.books : this.refresh();
    }

    /** Forcibly refresh user books even if already fetched. */
    async refresh(): Promise<Book[]> {
        this.books = await BooksAPI.getAll();
        return this.books;
    }

    /**
     * Change book shelf.
     * @param book - book which shelf to change
     * @param shelf - shelf to place book on.
     */
    async setBookShelf(book: Book, shelf: string): Promise<void> {
        try {
            // update book shelf locally
            book.shelf = shelf;

            // update book shelf on a server
            await BooksAPI.update(book, shelf);
        }
        catch (e) {
            // re-fetch all books if error
            console.error(e);
            await this.refresh();
        }
    }
}

export const bookService = new BookService();
