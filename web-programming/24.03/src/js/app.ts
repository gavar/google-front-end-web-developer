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
    stars: 0,
};

// cheats
const QUICK_WIN = false;

interface MemoryGameProps {
    deck: HTMLElement;
    moves: HTMLElement;
    restart: HTMLElement;
}

const GAME_OVER = new Event("game-over");

const CORRECT = "correct";
const SELECTION = "selection";
type MemoryGameCardStatus = "correct" | "selection";

interface MemoryGameCard {
    element: HTMLElement;
    status?: MemoryGameCardStatus,
}

interface MemoryGameState {
    visible: boolean;
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
    }

    /** Restart the game. */
    public restart() {

        // reset application state
        store.moves = 0;
        store.stars = 0;

        this.setState((state, props) => {

            // remove previous cards
            for (const card of state.cards)
                card.element.remove();

            // default state
            const next = this.initialState();

            // create cards
            for (let i = 0; i < icons.length; i++) {
                const element = document.createElement("li");
                element.classList.add("card");

                const icon = document.createElement("i");
                icon.classList.add("fa", `fa-${icons[i]}`);
                element.appendChild(icon);

                next.cards.push(
                    {element: element},
                    {element: element.cloneNode(true) as HTMLElement},
                );
            }

            // quick win
            if (QUICK_WIN) {
                for (let i = next.cards.length - 3; i >= 0; i--) {
                    next.cards[i].status = CORRECT;
                }
            }

            // shuffle
            shuffle(next.cards);

            // attach to the document
            const fragment = document.createDocumentFragment();
            for (const card of next.cards) fragment.appendChild(card.element);
            props.deck.appendChild(fragment);

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

            // decide if correct selections
            if (this.countOf(state.cards, SELECTION) > 1) {
                this.setState(state => {
                    store.moves++;
                    this.analyzeSelections(state);
                    return state;
                });
            }
        });
    }

    private analyzeSelections(state: MemoryGameState) {

        // check if classes of all selected card icons are equal
        const selections = state.cards.filter(x => x.status == SELECTION);
        const classes = selections.map(x => x.element.firstElementChild.className);
        const correct = classes.every((value, index, array) => value === array[0]);

        if (!correct) {
            // show wrong result for some time
            setTimeout(() => {
                // change status to default
                this.setStatusOfSelections(void 0);
            }, this.delay);
        }
        else {
            // change status to correct
            this.setStatusOfSelections(CORRECT);
            if (this.isGameOver(state))
                this.dispatchEvent(GAME_OVER);
        }
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
        props.view.style.display = state.visible ? null : "none";
        props.moves.innerText = store.moves.toString();
        props.stars.innerText = store.stars.toString();
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
    deck: document.querySelector<HTMLUListElement>("ul.deck"),
    moves: document.querySelector<HTMLElement>(".moves"),
    restart: document.querySelector<HTMLElement>(".restart"),
});

const gameOver = new GameOver({
    game: memoryGame,
    view: document.querySelector<HTMLElement>(".game-over"),
    moves: document.querySelector<HTMLElement>(".game-over .moves"),
    stars: document.querySelector<HTMLElement>(".game-over .stars"),
    restart: document.querySelector<HTMLElement>(".game-over .restart"),
});
