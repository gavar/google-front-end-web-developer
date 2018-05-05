/** Empty function for stub purposes. */
function noop() { }

/** List of icons. */
const icons: string[] = [
    "anchor",
    "bicycle",
    "bolt",
    "bomb",
    "cube",
    "diamond",
    "leaf",
    "paper-plane-o",
];

/** Shuffle array entries. */
function shuffle<T>(array: T[]): T[] {
    let t: T;
    let r: number;
    for (let i = array.length - 1; i >= 0; i--) {
        r = Math.floor(Math.random() * i);
        t = array[i];
        array[i] = array[r];
        array[r] = t;
    }
    return array;
}

interface Component<P, S> {
    /** Called immediately after a component is mounted. */
    componentWillMount?(props: Readonly<P>, state: Readonly<S>): void;

    /** Called immediately after a component is mounted. */
    componentDidMount?(props: Readonly<P>, state: Readonly<S>): void;
}

/**
 * Base component that provides lifecycle hooks and automatically repaints whenever state changes.
 */
abstract class Component<P, S> implements EventTarget {

    private readonly events: EventTarget;
    private readonly props: Readonly<P>;
    private readonly state: Readonly<S>;
    private dirty: boolean;

    protected constructor(props: P) {
        this.componentWillMount = this.componentWillMount || noop;
        this.componentDidMount = this.componentDidMount || noop;

        this.events = document.createDocumentFragment();
        this.props = {...props as any};
        this.state = this.initialState();

        this.componentWillMount(this.props, this.state);
        this.render(this.props, this.state);
        this.componentDidMount(this.props, this.state);
    }

    /**
     * Set next state of the component to render.
     * @param next - function that returns next state of the component.
     */
    setState(next: (prev?: S, props?: P) => Partial<S> | void);

    /**
     * Set next state of the component to render.
     * @param next - next state value.
     */
    setState(next: Partial<S>);

    setState(next) {
        const prev = this.state;
        const props = this.props;

        if (typeof next === "function")
            next = next(prev, props) || prev;

        Object.assign(this.state, next);
        if (this.dirty) return;
        this.dirty = true;
        setTimeout(this.repaint, 0);
    }

    /** Render state of the component. */
    abstract render(props?: Readonly<P>, state?: Readonly<S>);

    /** @inheritDoc */
    addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
        this.events.addEventListener(type, listener, options);
    }

    /** @inheritDoc */
    dispatchEvent(evt: Event): boolean {
        return this.events.dispatchEvent(evt);
    }

    /** @inheritDoc */
    removeEventListener(type: string, listener?: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void {
        this.events.removeEventListener(type, listener, options);
    }

    /** Get initial state of the component. */
    protected initialState(): S {
        return {} as any;
    }

    private readonly repaint = () => {
        this.dirty = false;
        this.render(this.props, this.state);
    };
}

interface StoreState {
    moves: number;
    stars: number;
    startTime: number;
    completeTime: number;
}

const INITIAL_STORE_STATE: StoreState = {
    moves: 0,
    stars: 3,
    startTime: 0,
    completeTime: 0,
};

/** Global application state storage. */
const STORE: StoreState = {...INITIAL_STORE_STATE};

/** Dev purposes cheat to win in 1 move. */
const QUICK_WIN = false;

/** Event fired when user completes the game. */
const GAME_OVER_EVENT = new Event("game-over");

const CORRECT = "correct";
const INCORRECT = "incorrect";
const SELECTION = "selection";
type MemoryGameCardStatus = "selection" | "correct" | "incorrect";

interface MemoryGameProps {
    time: HTMLElement;
    deck: HTMLElement;
    moves: HTMLElement;
    stars: HTMLElement;
    restart: HTMLElement;
}

interface MemoryGameState {
    visible: boolean;
    mistakes: number;
    stars: HTMLElement[];
    cards: MemoryGameCard[];
}

interface MemoryGameCard {
    shows: number;
    element: HTMLElement;
    status?: MemoryGameCardStatus;
}

/** List of dynamically applied card classes. */
const CARD_CLASSES = [
    "open",
    "show",
    "match",
    "wrong",
];

class MemoryGame extends Component<MemoryGameProps, MemoryGameState> {

    private readonly delay: number = 1000;

    constructor(props: MemoryGameProps) {
        super(props);

        // events
        props.deck.addEventListener("click", this.onDeckClick.bind(this));
        props.restart.addEventListener("click", this.onRestartClick.bind(this));
    }

    /** @inheritDoc */
    public render(props: Readonly<MemoryGameProps>, state: Readonly<MemoryGameState>) {

        props.deck.style.display = state.visible ? null : "none";
        props.moves.innerText = STORE.moves.toString();

        // update cards
        for (const card of state.cards) {
            switch (card.status) {
                case CORRECT:
                    card.element.classList.add("show", "match");
                    break;

                case SELECTION:
                    card.element.classList.add("show", "open");
                    break;

                case INCORRECT:
                    card.element.classList.add("show", "open", "wrong");
                    break;

                default:
                    card.element.classList.remove.apply(card.element.classList, CARD_CLASSES);
                    break;
            }
        }

        // update stars
        while (state.stars.length > STORE.stars)
            state.stars.pop().remove();
    }

    /** Restart the game. */
    public restart() {

        // reset application state
        for (const key in STORE) delete STORE[key];
        Object.assign(STORE, INITIAL_STORE_STATE);

        this.setState((state, props) => {

            // default state
            const next = this.initialState();

            // remove previous cards
            for (const card of state.cards)
                card.element.remove();

            // create cards
            for (const icon of icons) {
                const element = document.createElement("li");
                element.classList.add("card");

                const i = document.createElement("i");
                i.classList.add("fa", `fa-${icon}`);
                element.appendChild(i);

                next.cards.push(
                    {shows: 0, element},
                    {shows: 0, element: element.cloneNode(true) as HTMLElement},
                );
            }

            // remove previous stars
            for (const star of state.stars)
                star.remove();

            // create stars
            for (let i = 0; i < STORE.stars; i++) {
                const element = document.createElement("li");
                const icon = document.createElement("i");
                icon.classList.add("fa", "fa-star");
                element.appendChild(icon);
                next.stars.push(element);
            }

            // quick win
            if (QUICK_WIN) {
                for (let i = next.cards.length - 3; i >= 0; i--) {
                    next.cards[i].status = CORRECT;
                }
            }

            // shuffle
            shuffle(next.cards);

            // attach cards to the document
            {
                const fragment = document.createDocumentFragment();
                for (const card of next.cards) fragment.appendChild(card.element);
                props.deck.appendChild(fragment);
            }

            // attach stars to the document
            {
                const fragment = document.createDocumentFragment();
                for (const star of next.stars) fragment.appendChild(star);
                props.stars.appendChild(fragment);
            }

            return next;
        });
    }

    /** @inheritDoc */
    componentWillMount() {
        this.restart();
    }

    /** @inheritDoc */
    componentDidMount(props: MemoryGameProps) {
        this.update(props);
        setInterval(() => this.update(props), 250);
    }

    /** @inheritDoc */
    protected initialState(): MemoryGameState {
        return {
            visible: true,
            mistakes: 0,
            stars: [],
            cards: [],
        };
    }

    private update(props: Readonly<MemoryGameProps>) {
        const now = Date.now();
        const duration = new Date((STORE.completeTime || now) - (STORE.startTime || now));

        let seconds: number | string = duration.getSeconds();
        if (duration.getMilliseconds() >= 500) seconds++;
        if (seconds < 10) seconds = "0" + seconds;

        let minutes: number | string = duration.getMinutes();
        if (minutes < 10) minutes = "0" + minutes;

        const text = `${minutes}:${seconds}`;
        if (props.time.innerText !== text)
            props.time.innerText = text;
    }

    private isGameOver(state: MemoryGameState) {
        return this.countOf(state.cards, CORRECT) === state.cards.length;
    }

    private cardOf(cards: MemoryGameCard[], element: HTMLLIElement): MemoryGameCard {
        for (const card of cards)
            if (card.element === element)
                return card;
    }

    private countOf(cards: MemoryGameCard[], status: MemoryGameCardStatus): number {
        let count = 0;
        for (const card of cards)
            if (card.status === status)
                count++;

        return count;
    }

    private onSelectListElement(element: HTMLLIElement) {
        this.setState(state => {

            // start timer
            if (STORE.startTime <= 0)
                STORE.startTime = Date.now();

            // check if card already selected or correct
            const card = this.cardOf(state.cards, element);
            switch (card.status) {
                case SELECTION:
                case CORRECT:
                    return;
            }

            // max active selections
            if (this.countOf(state.cards, SELECTION) > 1)
                return;

            // set card as active
            card.status = SELECTION;
            card.shows++;

            const selections = [];
            for (let i = 0; i < state.cards.length; i++)
                if (state.cards[i].status === SELECTION)
                    selections.push(i);

            // decide if correct selections
            if (selections.length > 1) {
                STORE.moves++;
                const match = this.hasMatch(state, selections);
                if (match) this.onSuccessfulMatch(selections);
                else this.onMatchFailure(selections);
            }

            return state;
        });
    }

    private hasMatch(state: MemoryGameState, indexes: number[]) {
        if (indexes.length < 1)
            return false;

        const first = state.cards[indexes[0]].element.firstElementChild;
        for (let i = 1; i < indexes.length; i++) {
            const icon = state.cards[indexes[i]].element.firstElementChild;
            if (first.className !== icon.className)
                return false;
        }

        return true;
    }

    private onSuccessfulMatch(indexes: number[]) {
        this.setState(state => {
            // update status
            for (const index of indexes)
                state.cards[index].status = CORRECT;

            // game over?
            if (this.isGameOver(state)) {
                STORE.completeTime = Date.now();
                this.dispatchEvent(GAME_OVER_EVENT);
            }
        });
    }

    private onMatchFailure(indexes: number[]) {
        this.setState(state => {
            let isAnyShownPreviously = false;

            // update status
            for (const index of indexes) {
                const card = state.cards[index];
                if (card.shows > 1) isAnyShownPreviously = true;
                card.status = INCORRECT;
            }

            // check if made mistake
            if (isAnyShownPreviously)
                state.mistakes++;

            // update stars
            STORE.stars = this.calculateStars(state.mistakes);
        });

        setTimeout(() => {
            this.deleteStatusByIndexes(indexes);
        }, this.delay);
    }

    private deleteStatusByIndexes(indexes: number[]) {
        this.setState((state) => {
            for (const index of indexes) {
                delete state.cards[index].status;
            }
        });
    }

    private calculateStars(mistakes: number): number {
        console.log("moves:", STORE.moves, "mistakes:", mistakes);
        // convert mistakes to stars
        if (mistakes < 3) return 3; // less then 3 mistakes
        if (mistakes < 6) return 2; // from 3 to 5 mistakes
        return 1; // more then 5 mistakes
    }

    private onDeckClick(e: MouseEvent) {
        if (e.target instanceof HTMLLIElement)
            this.onSelectListElement(e.target);
    }

    private onRestartClick() {
        this.restart();
    }
}

interface GameOverProps {
    view: HTMLElement;
    game: MemoryGame;
    minutes: HTMLElement;
    seconds: HTMLElement;
    moves: HTMLElement;
    stars: HTMLElement;
    restart: HTMLElement;
}

interface GameOverState {
    visible: boolean;
}

class GameOver extends Component<GameOverProps, GameOverState> {

    constructor(props: GameOverProps) {
        super(props);
        props.game.addEventListener("game-over", this.onGameOver.bind(this));
        props.restart.addEventListener("click", this.onPlayAgainClick.bind(this));
    }

    /** @inheritDoc */
    render(props?: Readonly<GameOverProps>, state?: Readonly<GameOverState>) {

        const duration = new Date(STORE.completeTime - STORE.startTime);
        props.seconds.innerText = `${duration.getSeconds()} seconds`;
        props.minutes.innerText = `${duration.getMinutes()} minutes`;

        props.moves.innerText = STORE.moves.toString();
        props.stars.innerText = STORE.stars.toString();

        switch (state.visible) {
            case true:
                props.view.classList.add("show");
                break;
            case false:
                props.view.classList.remove("show");
                break;
        }
    }

    /** @inheritDoc */
    protected initialState(): GameOverState {
        return {
            visible: undefined,
        };
    }

    private onGameOver() {
        this.setState({visible: true});
    }

    private onPlayAgainClick() {
        this.setState((state, props) => {
            state.visible = false;
            props.game.restart();
            return state;
        });
    }
}

// RUN GAME
const gameView = document.querySelector<HTMLElement>(".game");
const memoryGame = new MemoryGame({
    deck: gameView.querySelector<HTMLUListElement>(".deck"),
    time: gameView.querySelector<HTMLElement>(".time"),
    moves: gameView.querySelector<HTMLElement>(".moves"),
    stars: gameView.querySelector<HTMLElement>(".stars"),
    restart: gameView.querySelector<HTMLElement>(".restart"),
});

const gameOverView = document.querySelector<HTMLElement>(".game-over");
const gameOver = new GameOver({
    game: memoryGame,
    view: gameOverView,
    seconds: gameOverView.querySelector<HTMLElement>(".seconds"),
    minutes: gameOverView.querySelector<HTMLElement>(".minutes"),
    moves: gameOverView.querySelector<HTMLElement>(".moves"),
    stars: gameOverView.querySelector<HTMLElement>(".stars"),
    restart: gameOverView.querySelector<HTMLElement>(".restart"),
});
