class PixelCanvas {

    private readonly table: HTMLTableElement;
    private readonly colorPicker: HTMLInputElement;

    constructor(table: HTMLTableElement, colorPicker: HTMLInputElement) {
        this.table = table;
        this.colorPicker = colorPicker;
        this.table.addEventListener("pointerdown", this.onMouseDown.bind(this));
        this.table.addEventListener("pointerenter", this.onPointerEnter.bind(this), true);
        this.table.addEventListener("contextmenu", e => e.preventDefault());
    }

    resize(width: number, height: number) {

        console.log("resize:", width, "x", height);

        // hide to avoid repaints
        this.table.style.visibility = "hidden";

        // remove excessive rows
        const rows = this.table.childNodes as NodeListOf<HTMLTableRowElement>;
        while (rows.length > height)
            this.table.lastElementChild.remove();

        // add missing rows
        for (let r = rows.length; r < height; r++)
            this.table.appendChild(document.createElement("tr"));

        for (let r = 0; r < height; r++) {
            const row = rows[r];

            // remove excessive columns
            const columns = row.childNodes;
            while (columns.length > width)
                row.lastElementChild.remove();

            // add missing columns
            for (let c = columns.length; c < width; c++)
                row.appendChild(document.createElement("td"));
        }

        // set visible
        this.table.style.visibility = null;
    }

    private onMouseDown(e: MouseEvent) {
        e.preventDefault();
        if (e.target instanceof HTMLTableCellElement) {
            switch (e.buttons) {
                case 1:
                    e.target.style.backgroundColor = this.colorPicker.value;
                    break;
                case 2:
                    e.target.style.backgroundColor = null;
                    break
            }
        }
    }

    private onPointerEnter(e: MouseEvent): any {
        this.onMouseDown(e);
    }
}

interface SizePicker {
    x: number;
    y: number;
}

(function () {

    // references
    const width = document.querySelector<HTMLInputElement>("#inputWidth");
    const height = document.querySelector<HTMLInputElement>("#inputHeight");
    const canvas = document.querySelector<HTMLTableElement>("#pixelCanvas");
    const sizePicker = document.querySelector<HTMLFormElement>("#sizePicker");
    const colorPicker = document.querySelector<HTMLInputElement>("#colorPicker");

    // parse state from url
    const params = new URLSearchParams(window.location.hash.slice(1));
    const x = Number(params.get("x") || width.value);
    const y = Number(params.get("y") || height.value);
    width.value = x.toString();
    height.value = y.toString();

    // initialize canvas
    const drawing = new PixelCanvas(canvas, colorPicker);
    drawing.resize(x, y);

    sizePicker.addEventListener("submit", e => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = formToObject<SizePicker>(form);

        // save params in url
        const params = objectToParams(data);
        window.location.hash = params.toString();

        // resize drawing
        drawing.resize(data.x, data.y)
    });

    function formToObject<T extends object>(form: HTMLFormElement): T {
        const data: T = {} as any;
        const formData = new FormData(form);
        for (const [key, value] of formData.entries())
            data[key] = value;
        return data;
    }

    function objectToParams(object: object): URLSearchParams {
        const params = new URLSearchParams();
        for (const key in object)
            params.set(key, object[key]);
        return params;
    }
})();

