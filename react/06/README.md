# MyReads: A Book Lending App
This project is a part of [Front-End Web Developer](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd001) course.
Project contains application for tracking book you've read, reading or want to read in future. Project focused on proper usage of React components state management.

## Getting Started
1. Acquire project:
    - *(easy)* use [online version](https://gavar.github.io/google-front-end-web-developer/react/06/build/index.html) hosted on GitHub pages;
    - *(preferable)* download the source code [archive](https://github.com/gavar/google-front-end-web-developer/releases/download/project%2Fmy-reads/my-reads.zip);
    - *(advanced)* you could also clone a git subtree from [GitHub](https://github.com/gavar/google-front-end-web-developer/tree/develop/react/06);
2. Make sure [NodeJS](https://nodejs.org) installed on your machine.
3. Run `npm run start` or `yarn start` to start development server
5. The script should automatically open the page.

## Create React App
This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) + [react-scripts-ts](https://www.npmjs.com/package/react-scripts-ts) for typescript support. You can find more information on how to perform common tasks [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Backend Server
To simplify your development process, we've provided a backend server for you to develop against. The provided file [`books-api.ts`](src/books-api.ts) contains the methods you will need to perform necessary operations on the backend:

* [`getAll`](#getall)
* [`update`](#update)
* [`search`](#search)

### `getAll`

Method Signature:

```js
getAll()
```

* Returns a Promise which resolves to a JSON object containing a collection of book objects.
* This collection represents the books currently in the bookshelves in your app.

### `update`

Method Signature:

```js
update(book, shelf)
```

* book: `<Object>` containing at minimum an `id` attribute
* shelf: `<String>` contains one of ["wantToRead", "currentlyReading", "read"]  
* Returns a Promise which resolves to a JSON object containing the response data of the POST request

### `search`

Method Signature:

```js
search(query)
```

* query: `<String>`
* Returns a Promise which resolves to a JSON object containing a collection of a maximum of 20 book objects.
* These books do not know which shelf they are on. They are raw results only. You'll need to make sure that books have the correct state while on the search page.

## Important
The backend API uses a fixed set of cached search results and is limited to a particular set of search terms, which can be found in [SEARCH_TERMS.md](SEARCH_TERMS.md). That list of terms are the _only_ terms that will work with the backend, so don't be surprised if your searches for Basket Weaving or Bubble Wrap don't come back with any results.

## Contributing
Project has strictly education purposes and will no accept any pull requests.

## Authors
* **[Max Stankevich](https://github.com/gavar)**

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details
