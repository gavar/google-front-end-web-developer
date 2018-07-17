import * as BooksAPI from "../books-api";
import {Book} from "../types";

export class BookService {
    private books: Book[];
    private readonly booksByID = new Map<string, Book>();
    private readonly booksByShelf = new Map<string, Book[]>();

    /**
     * Get books on a shelf, should be previously fetched by {@link fetch}
     * @param shelf - shelf with books.
     */
    booksOnShelf(shelf: string): Book[] | undefined {
        return this.booksByShelf.get(shelf);
    }

    /** Lazily fetch user books if not yet fetched. */
    async fetch(): Promise<Book[]> {
        return this.books ? this.books : this.refresh();
    }

    /** Forcibly refresh user books even if already fetched. */
    async refresh(): Promise<Book[]> {
        this.books = await BooksAPI.getAll();

        // map books by id
        this.booksByID.clear();
        for (const book of this.books)
            this.booksByID.set(book.id, book);

        // map books by shelf
        this.booksByShelf.forEach(books => books.length = 0);
        for (const book of this.books) {
            const books = this.booksByShelf.get(book.shelf) || [];
            books.push(book);
            this.booksByShelf.set(book.shelf, books);
        }

        return this.books;
    }

    /**
     * Change book shelf.
     * @param book - book which shelf to change
     * @param shelf - shelf to place book on.
     */
    async setBookShelf(book: Book, shelf: string): Promise<Book> {
        try {
            // already required shelf?
            if (book.shelf === shelf)
                return book;

            // update shelf of a book
            this.removeBook(book);
            if (shelf) {
                book.shelf = shelf;
                this.addBook(book);
            }

            // update book shelf on a server
            await BooksAPI.update(book, shelf || "none");
            return book;
        }
        catch (e) {
            // re-fetch all books if error
            console.error(e);
            await this.refresh();
            return this.booksByID.get(book.id) as Book;
        }
    }

    /**
     * Search for a books that satisfy given query.
     * @param query - query defining search criteria, like author, title, etc
     */
    async search(query: string): Promise<Book[]> {
        try {
            // empty query?
            query = query.trim();
            if (!query.length)
                return [];

            // query books and ensure has fetched user books
            const search = BooksAPI.search(query);
            const fetch = this.fetch();

            // wait for result
            const books = await search;
            if (!books || books.error)
                return [];

            // wait for user books
            await fetch;

            // synchronize book shelves
            for (const book of books) {
                const existing = this.booksByID.get(book.id);
                if (existing) book.shelf = existing.shelf;
            }

            return books;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }

    private addBook(book: Book): void {
        if (this.booksByID.has(book.id))
            return;

        this.books.push(book);
        this.booksByID.set(book.id, book);

        const books = this.booksByShelf.get(book.shelf) || [];
        books.push(book);
        this.booksByShelf.set(book.shelf, books);
    }

    private removeBook(book: Book): void {
        if (!this.booksByID.delete(book.id))
            return;

        const index = this.books.indexOf(book);
        this.books.splice(index, 1);

        const books = this.booksByShelf.get(book.shelf) || [];
        if (books) books.splice(books.indexOf(book), 1);

        delete book.shelf;
    }
}

export const bookService = new BookService();
