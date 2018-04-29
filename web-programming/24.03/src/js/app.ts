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

function shuffle<T>(array: Array<T>): Array<T> {
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

abstract class Component<P, S> extends EventTarget {
    private readonly props: Readonly<P>;
    private readonly state: Readonly<S>;

    private dirty: boolean;

    protected constructor(props: P) {
        super();

        // setup
        this.props = Object.assign({}, props);
        this.repaint = this.repaint.bind(this);

        // state
        this.state = this.initialState();

        // mount
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

        if (typeof next == "function")
            next = next(prev, props) || prev;

        Object.assign(this.state, next);
        if (this.dirty) return;
        this.dirty = true;
        setTimeout(this.repaint, 0);
    }

    /** Render state of the component. */
    abstract render(props?: Readonly<P>, state?: Readonly<S>);

    /** Called immediately before mounting occurs, and before {@link Component#render}. */
    protected componentWillMount(props?: Readonly<P>, state?: Readonly<S>) { }

    /** Called immediately after a component is mounted. */
    protected componentDidMount(props?: Readonly<P>, state?: Readonly<S>) { }

    /** Get initial state of the component. */
    protected initialState(): S {
        return {} as S;
    }

    private repaint() {
        this.dirty = false;
        this.render(this.props, this.state);
    }
}

interface ApplicationState {
    moves: number;
    stars: number;
}

const store: ApplicationState = {
    moves: 0,
    stars: 3,
};

// cheats
const QUICK_WIN = false;

interface MemoryGameProps {
    deck: HTMLElement;
    moves: HTMLElement;
    stars: HTMLElement;
    restart: HTMLElement;
}

const GAME_OVER = new Event("game-over");

const CORRECT = "correct";
const SELECTION = "selection";
type MemoryGameCardStatus = "correct" | "selection";

interface MemoryGameCard {
    shows: number;
    element: HTMLElement;
    status?: MemoryGameCardStatus,
}

interface MemoryGameState {
    visible: boolean;
    stars: HTMLElement[],
    cards: MemoryGameCard[],
}

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
        props.moves.innerText = store.moves.toString();

        // update cards
        for (const card of state.cards) {
            switch (card.status) {
                case CORRECT:
                case SELECTION:
                    card.element.classList.add("show");
                    break;

                default:
                    card.element.classList.remove("show");
                    break;
            }
        }

        // update stars
        while (state.stars.length > store.stars)
            state.stars.pop().remove();
    }

    /** Restart the game. */
    public restart() {

        // reset application state
        store.moves = 0;
        store.stars = 3;

        this.setState((state, props) => {

            // default state
            const next = this.initialState();

            // remove previous cards
            for (const card of state.cards)
                card.element.remove();

            // create cards
            for (let i = 0; i < icons.length; i++) {
                const element = document.createElement("li");
                element.classList.add("card");

                const icon = document.createElement("i");
                icon.classList.add("fa", `fa-${icons[i]}`);
                element.appendChild(icon);

                next.cards.push(
                    {shows: 0, element: element},
                    {shows: 0, element: element.cloneNode(true) as HTMLElement},
                );
            }

            // remove previous stars
            for (const star of state.stars)
                star.remove();

            // create stars
            for (let i = 0; i < store.stars; i++) {
                const element = document.createElement("li");
                const icon = document.createElement("i");
                icon.classList.add("fa", `fa-star`);
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
    protected componentWillMount() {
        this.restart();
    }

    /** @inheritDoc */
    protected initialState(): MemoryGameState {
        return {
            visible: true,
            stars: [],
            cards: [],
        };
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
        for (let i = 0; i < cards.length; i++)
            if (cards[i].status === status)
                count++;

        return count;
    }

    /**
     * Modify status of the cards which have given status.
     * @param status - status to change.
     * @param next - status to set.
     */
    private setStatusOf(status: MemoryGameCardStatus, next: MemoryGameCardStatus) {
        this.setState(state => {
            for (const card of state.cards)
                if (card.status === status)
                    card.status = next;

            return state;
        });
    }

    /**
     * Set status of the cards with {@link SELECTION} status.
     * @param status - status to set.
     */
    private setStatusOfSelections(status: MemoryGameCardStatus) {
        this.setStatusOf(SELECTION, status);
    }

    private onSelectListElement(element: HTMLLIElement) {
        this.setState(state => {

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
                if (state.cards[i].status == SELECTION)
                    selections.push(i);

            // decide if correct selections
            if (selections.length > 1) {
                store.moves++;
                const correct = this.isCorrect(state, selections);
                if (correct) this.onCorrectSelection(selections);
                else this.onWrongSelection(selections);
                store.stars = this.calculateStars(state);
            }

            return state;
        });
    }

    private isCorrect(state: MemoryGameState, selections: number[]) {
        if (selections.length < 1)
            return false;

        const first = state.cards[selections[0]].element.firstElementChild;
        for (let i = 1; i < selections.length; i++) {
            const icon = state.cards[selections[i]].element.firstElementChild;
            if (first.className != icon.className)
                return false;
        }

        return true;
    }

    private onCorrectSelection(selection: number[]) {
        this.setState(state => {
            // update status
            for (const index of selection) {
                state.cards[index].status = CORRECT;
            }
            // game over?
            if (this.isGameOver(state))
                this.dispatchEvent(GAME_OVER);
        });
    }

    private onWrongSelection(selection: number[]) {
        setTimeout(() => {
            this.setState(state => {
                // update status
                for (const index of selection) {
                    const card = state.cards[index];
                    delete card.status;
                }
            });
        }, this.delay);
    }

    private calculateStars(state: MemoryGameState): number {
        let shows = 0;
        let mistakes = 0;
        for (const card of state.cards) {
            shows += card.shows;
            if (card.shows > 1)
                mistakes += card.shows - 1;
        }

        // all values are paired
        shows *= .5;
        mistakes *= .5;
        console.log("shows:", shows, "mistakes:", mistakes);

        // mistakes to stars
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
        props.moves.innerText = store.moves.toString();
        props.stars.innerText = store.stars.toString();
        props.view.style.display = state.visible ? null : "none";
    }

    /** @inheritDoc */
    protected initialState(): GameOverState {
        return {
            visible: false,
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
const memoryGame = new MemoryGame({
    deck: document.querySelector<HTMLUListElement>(".game .deck"),
    moves: document.querySelector<HTMLElement>(".game .moves"),
    stars: document.querySelector<HTMLElement>(".game .stars"),
    restart: document.querySelector<HTMLElement>(".game .restart"),
});

const gameOver = new GameOver({
    game: memoryGame,
    view: document.querySelector<HTMLElement>(".game-over"),
    moves: document.querySelector<HTMLElement>(".game-over .moves"),
    stars: document.querySelector<HTMLElement>(".game-over .stars"),
    restart: document.querySelector<HTMLElement>(".game-over .restart"),
});
