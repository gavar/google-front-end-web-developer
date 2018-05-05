# Memory Game

This project is a part of [Front-End Web Deveveloper](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd001) course. Project contains simple memory game, where player need to open cards, to find two cards with the same icon. So when player open two cards sequentially with the same icon, it's considered as successful match; if icons are different, then score penalty is applied.

Player has 3 stars ratings at the very begging, which is the best possible rating in the game. Whenever the incorrect match of icons occurs, players gets penalty resulting in lower rating. Player stars rating will be reduced to 2 stars if he make more then 2 mistakes, and will be reduced to 1 star, if player has more then 5 wrong matches, which is the lowest score in a game. If player opens two cards, where both of the cards are opened for a first time - it doesnt't count as a mistake, since player had no chance to see them before, but if any of the cards has been opened before, the penalty is applied. Besides that, game is tracking how long it took player to complete the game - the timer starts when first card is clicked.
 
 You can find game indicators, at the top left and right corners, like moves counter, rating, time counter and restart button.
 
 When player completes the game by finding match for every card on a board, the modal window appears, where player can observe his results. This window includes amount of time spent, number of moves and final rating. Player has possibility to restart the game by pressing "Play Again" button.
 
### Prerequisites
 Project is made of pure HTML / CSS / JS files, so there is no special prerequisites and it could be run just in a browser.
 However, JavaScript files use ES6 syntax, so you need to keep in mind, whether your browser supports ES6 syntax.
 
## Getting Started
 Use browser to open the [index](../%23u/index.html) file and play the game.

## Contributing

Project has strictly education purposes and will no accept any pull requests.

## Authors

* **[Max Stankevich](https://github.com/gavar)**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
