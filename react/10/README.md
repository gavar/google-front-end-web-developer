# Car Wash Nearby: Google Places + Foursquare via React
This project is a part of [Front-End Web Developer](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd001) course.

Project contains application for searching a car wash facility near your location. Project is a final graduation task, focused on proper usage of React components, state management, external API and more.

## Getting Started
#### Acquire project:
- *(easy)* use [online version](https://gavar.github.io/google-front-end-web-developer/react/10/dist/index.html) hosted on GitHub pages;
- *(preferable)* download the source code [archive](https://github.com/gavar/google-front-end-web-developer/releases/download/project%2Fcar-wash-nearby/car-wash-nearby.zip);
- *(advanced)* clone a git subtree from [GitHub](https://github.com/gavar/google-front-end-web-developer/tree/develop/react/10);
    
#### Dependencies
* make sure [NodeJS](https://nodejs.org) installed on your machine by running `node -v`.
* install [Yarn](https://yarnpkg.com/en/) package manager via `npm i yarn --dev`

#### Build project
Project assembly is powered via [Webpack](https://webpack.js.org/), so any related configuration flags will apply. For example, to change a serving port you could provide `--port $PORT$` flag. You can find webpack config file [here](./webpack.config.ts). The full list of options is defined in [Webpack CLI documentation](https://webpack.js.org/api/cli/)
* run `yarn build` to make production build
* run `yarn webpack` to make development build

By default, you should find output files in [dist](./dist) directory.
No server required to run the project, you can run application by opening [index.html](./dist/index.html) in your browser. However, the service work will not work in that case, since it doesn't support `file://` protocol.

#### Develop project
To serve project files in development mode with HMR (Hot Module Replacement) support, run `yarn serve`.
By default, you should able to access the app being served on [localhost:8080](http://localhost:8080)

## Webpack
Project build process is powered by custom yet flexible webpack orchestration including TypeScript support.
You can find all of the configuration options and bootstrapping in [webpack-configurer](./packages/webpack/webpack-configurer.ts).

## Features
The main purpose of the app is to help you to find a place where to wash a car. For that reasons, the [Google Places API](https://developers.google.com/places/web-service) is being used. Every time you move the map, the request is sent to search for nearby places with `car_wash` type. That means - there are no pre-defined markers on a map, and all of the content is served dynamically depending on your needs. For better car wash facility choice, the [Foursquare API](https://developer.foursquare.com/) provides possibility to display how much people liked the place.

#### Responsive Design
Works on both mobile and desktop devices

#### Places Filter
At the left side, you can find toggle-able navbar where you can filter nearby places by different search criteria, matching regular expression against: name, city, street, country. Hovering mouse over the item in a list, will highlight the marker on a map and vice versa, but only if it's not part of marker cluster. By clicking on an item, the marker info window appears.
 
#### Marker InfoWindow
When marker info window opens, it triggers request fetching place details, which include precise address, phone number, website and ratings. As an extra option, it also tries to find same place via [Foursquare Places API](https://developer.foursquare.com/docs/api/venues/search) and if it's there, fetch number of people likes the place.

#### Progressive Web App (PWA) Caching Strategies
Application use a [service worker](./src/sw/sw.ts) to manage how resources are being delivered for better user experience. The strategy may vary on a target host, but it's easily configurable via custom service worker router. For your disposal there are: `cache-only`, `cache-first`, `network-only`, `network-first`, `fastest` strategies available. Combining those, made it possible to deliver all of the data, including Google Maps, in an offline mode. For places requests from Google and Foursquare, the [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) powered by [Dexie](http://dexie.org/) being used out of the service worker.
 
#### React + TypeScript
Project is fully written in TypeScript (yes, including the service worker), which is a powerhouse combining with React. TypeScript makes easy tracking of the type relations, allows to use latest JS features and defines API contracts for better work in a team and ease of code navigation.
 
#### Performance
 Some of the techniques were applied to optimize performance.
 Having a lot of markers on map was producing heavy slow-downs on every state change (like hovering marker or item in a list) reducing the app FPS < 1.

For that reason some optimizations were made:
* places filter shows only first 20 best matches, but not a whole list
* markers have been merged in a clusters to reduces number of draw calls
* an application state was moved from the root application component, to shared isolated store services, resulting in [simple, yet powerful state management system](./packages/store), which relies on principle of "thinking in React". Refer to [State Management](#State Management) section for more info.

## Implementation Notes

### State Management
Components state is split up between different stores which are powered by React-like `setState` approach of state management via [store](./packages/store). The working principles are close to recently discovered [Unstated](https://github.com/jamiebuilds/unstated) state manager - state management with react in mind. Such technique (aka [Flux](https://facebook.github.io/flux/)) adds complexity by introducing `Component <> Store` relation (could be solved by, IoC but it's out of this project scope) and forces to use state-full components. But the benefits are great - it greatly improves performance by avoiding data calculations for the whole application tree and props propagation through a parent-child relations on every state change. Having a domain-specific stores (opposite of [Redux](https://redux.js.org/) global store) makes:
* components (views) being isolated from the application context, but only defining what type of external state they need;
* application (controller) bound to actual logic implementation, but not just props propagation;
* stores (model) type-safe and quicker since there are less data to check for modifications.

### Google API + TypeScript
You could be surprised by looking at [google-maps](./packages/google/maps) package since it just re-exporting existing namespace, but it's done specially to avoid referencing Google Maps object before the API script is loaded. Thankfully to TypeScript type erasure, all of those imports are removed after build. Consider example:
```
import {Geocoder, GeocoderRequest} from "$google/maps";
function geocode(request: GeocoderRequest) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(request: GeocoderRequest)
    ...
}
```
where imports are used purely as a types, but actual object instance being created via `google.maps` namespace.

## Contributing
Project has strictly education purposes and will no accept any pull requests.

## Authors
* **[Max Stankevich](https://github.com/gavar)**

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details
