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

interface MemoryGameProps {
    deck: HTMLElement;
    moves: HTMLElement;
    restart: HTMLElement;
}

const CORRECT = "correct";
const SELECTION = "selection";
type MemoryGameCardStatus = "correct" | "selection";

interface MemoryGameCard {
    element: HTMLElement;
    status?: MemoryGameCardStatus,
}

interface MemoryGameState {
    moves: number;
    cards: MemoryGameCard[],
}

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

class MemoryGame extends EventTarget {

    private dirty: boolean;
    private readonly state: MemoryGameState;
    private readonly props: MemoryGameProps;
    private readonly delay: number = 1000;

    constructor(props: MemoryGameProps) {
        super();

        // setup
        this.props = props;
        this.render = this.render.bind(this);

        // initial state
        this.state = this.initialState();
        this.restart();

        // render
        this.render();

        // events
        this.props.deck.addEventListener("click", this.onDeckClick.bind(this));
        this.props.restart.addEventListener("click", this.onRestartClick.bind(this));
    }

    /**
     * Render state of the game.
     */
    public render() {
        this.dirty = false;
        this.props.moves.innerText = this.state.moves.toString();

        for (const card of this.state.cards) {
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

    /**
     * Restart the game.
     */
    public restart() {

        // remove previous cards
        for (const card of this.state.cards)
            card.element.remove();

        // reset state
        Object.assign(this.state, this.initialState());

        // create cards
        for (let i = 0; i < icons.length; i++) {
            const element = document.createElement("li");
            element.classList.add("card");

            const icon = document.createElement("i");
            icon.classList.add("fa", `fa-${icons[i]}`);
            element.appendChild(icon);

            this.state.cards.push(
                {element: element},
                {element: element.cloneNode(true) as HTMLElement},
            );
        }

        // shuffle
        shuffle(this.state.cards);

        // attach to the document
        const fragment = document.createDocumentFragment();
        for (const card of this.state.cards) fragment.appendChild(card.element);
        this.props.deck.appendChild(fragment);

        // render
        this.setDirty();
    }

    /**
     * Construct initial state of the game.
     */
    private initialState(): MemoryGameState {
        return {
            moves: 0,
            cards: [],
        };
    }

    private setDirty() {
        if (this.dirty) return;
        setTimeout(this.render, 0);
    }

    private cardOf(element: HTMLLIElement): MemoryGameCard {
        for (const card of this.state.cards)
            if (card.element === element)
                return card;
    }

    private countOf(status: MemoryGameCardStatus): number {
        let count = 0;
        for (let i = 0; i < this.state.cards.length; i++)
            if (this.state.cards[i].status === status)
                count++;

        return count;
    }

    /**
     * Modify status of the cards which have given status.
     * @param status - status to change.
     * @param next - status to set.
     */
    private setStatusOf(status: MemoryGameCardStatus, next: MemoryGameCardStatus) {
        for (const card of this.state.cards)
            if (card.status === status)
                card.status = next;

        this.setDirty();
    }

    /**
     * Set status of the cards with {@link SELECTION} status.
     * @param status - status to set.
     */
    private setStatusOfSelections(status: MemoryGameCardStatus) {
        this.setStatusOf(SELECTION, status);
    }

    private onSelectListElement(element: HTMLLIElement) {

        // max active selections
        if (this.countOf(SELECTION) > 1)
            return;

        // check if card already active
        const card = this.cardOf(element);
        if (card.status == SELECTION)
            return;

        // set card as active
        card.status = SELECTION;

        // decide if correct selections
        if (this.countOf(SELECTION) > 1) {
            this.state.moves++;
            this.analyzeSelections();
        }

        this.setDirty();
    }

    private analyzeSelections() {

        // check if classes of all selected card icons are equal
        const selections = this.state.cards.filter(x => x.status == SELECTION);
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
        }
    }

    private onDeckClick(e: MouseEvent) {
        if (e.target instanceof HTMLLIElement)
            this.onSelectListElement(e.target);
    }

    private onRestartClick(e: MouseEvent) {
        this.restart();
    }
}

const memoryGame = new MemoryGame({
    deck: document.querySelector<HTMLUListElement>("ul.deck"),
    moves: document.querySelector<HTMLElement>(".moves"),
    restart: document.querySelector<HTMLElement>(".restart"),
});
