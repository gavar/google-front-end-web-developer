import React, {ChangeEvent, Component} from "react";
import {BookViewProps} from "./book-list";

export class BookShelfChanger extends Component<BookViewProps> {

  /** @inheritDoc */
  componentWillMount(): void {
    this.onChange = this.onChange.bind(this);
  }

  /** @inheritDoc */
  render() {
    const {shelf} = this.props.book;
    return <div className="book-shelf-changer">
      <select onChange={this.onChange} value={shelf}>
        <option value="move" disabled>Move to...</option>
        <option value="currentlyReading">Currently Reading</option>
        <option value="wantToRead">Want to Read</option>
        <option value="read">Read</option>
      </select>
    </div>;
  }

  onChange(e: ChangeEvent<HTMLSelectElement>) {
    const {book, changeBookShelf} = this.props;
    changeBookShelf(book, e.target.value);
  }
}
