import React from "react";
import {Book} from "../types";
import {BookShelfChanger} from "./book-shelf-changer";

export interface BookViewProps {
  book: Book;
  changeBookShelf: (book: Book, shelf: string) => void;
}

export function BookView(props: BookViewProps) {
  const {book, changeBookShelf} = props;
  const {title, authors, imageLinks} = book;
  const thumbnail = imageLinks && imageLinks.thumbnail;

  return <div className="book">
    <div className="book-top">
      <img className="book-cover" src={thumbnail} alt={title} height="200px" width="auto"/>
      <BookShelfChanger book={book} changeBookShelf={changeBookShelf}/>
    </div>
    <div className="book-title">{title}</div>
    <div className="book-authors">
      {authors && authors.map(author =>
        <div key={author}>{author}</div>,
      )}
    </div>
  </div>;
}
