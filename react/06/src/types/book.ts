export interface ImageLinks {
    thumbnail: string;
    smallThumbnail: string;
}

export interface Book {
    id: string;
    title: string;
    subtitle: string;
    shelf: string;
    authors: string[];
    imageLinks: ImageLinks;
}
