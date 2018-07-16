import {Book} from "./types";

const api = "https://reactnd-books-api.udacity.com";

// Generate a unique token for storing your bookshelf data on the backend server.
let token = localStorage.token;
if (!token)
    token = localStorage.token = Math.random().toString(36).substr(-8);

const headers = {
    "Accept": "application/json",
    "Authorization": token,
};

export const get = function (id: string): Promise<Book> {
    return fetch(`${api}/books/${id}`, {headers})
        .then(res => res.json())
        .then(data => data.book);
};

export function getAll(): Promise<Book[]> {
    return fetch(`${api}/books`, {headers})
        .then(res => res.json())
        .then(data => data.books);
}

export function update(book: Book, shelf: string): Promise<Book> {
    return fetch(`${api}/books/${book.id}`, {
        method: "PUT",
        headers: {
            ...headers,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({shelf}),
    }).then(res => res.json());
}

export function search(query: string): Promise<Book[]> {
    return fetch(`${api}/search`, {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({query}),
    }).then(res => res.json())
        .then(data => data.books);
}
