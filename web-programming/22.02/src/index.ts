import * as LZString from "lz-string";

const DRAWING_UPDATE = new Event("drawing-update");

interface Drawing {
    [color: string]: ColorPixels;
}

interface ColorPixels {
    [row: number]: number[];
}

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

    height(): number {
        return this.table.rows.length;
    }

    width(): number {
        return this.table.rows[0].cells.length;
    }

    find(x: number, y: number): HTMLTableDataCellElement {
        const rows = this.table.rows;
        if (rows.length < y) return;
        const row = rows[y].cells;
        if (row.length < x) return;
        return row[x];
    }

    resize(width: number, height: number) {

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
        this.table.dispatchEvent(DRAWING_UPDATE);
    }

    save(): Drawing {

        const drawing: Drawing = {};

        const rows = this.table.rows;
        for (let r = 0; r < rows.length; r++) {
            const row = rows[r].cells;
            for (let c = 0; c < row.length; c++) {
                const cell = row[c] as HTMLElement;
                if (cell.style.backgroundColor) {
                    const hex = this.rgbToHex(cell.style.backgroundColor);
                    const pixels: ColorPixels = drawing[hex] || {};
                    const row: number[] = pixels[r] || [];
                    row.push(c);
                    pixels[r] = row;
                    drawing[hex] = pixels;
                }
            }
        }

        return drawing;
    }

    load(drawing: Drawing) {
        this.table.style.visibility = "hidden";

        // tslint:disable-next-line:forin
        for (const color in drawing) {
            const pixels: ColorPixels = drawing[color];
            // tslint:disable-next-line:forin
            for (const row in pixels) {
                const y = Number(row);
                const columns = pixels[row];
                for (const x of columns) {
                    const cell = this.find(x, y);
                    cell.style.backgroundColor = `#${color}`;
                }
            }
        }

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
                    break;
                default:
                    return;
            }
            this.table.dispatchEvent(DRAWING_UPDATE);
        }
    }

    private onPointerEnter(e: MouseEvent): any {
        this.onMouseDown(e);
    }

    private rgbToHex(rgb: string): string {
        const left = rgb.indexOf("(");
        const right = rgb.indexOf("}");
        const values = rgb.slice(left + 1, right).split(",");
        let hex = values.map(v => Number(v).toString(16));
        if (!hex.every(x => x.length === 1))
            hex = hex.map(x => x.padStart(2, "0"));
        return hex.join("");
    }
}

interface QueryParams {
    x: number;
    y: number;
    data: string;
}

(function () {

    // references
    const width = document.querySelector<HTMLInputElement>("#inputWidth");
    const height = document.querySelector<HTMLInputElement>("#inputHeight");
    const table = document.querySelector<HTMLTableElement>("#pixelCanvas");
    const sizePicker = document.querySelector<HTMLFormElement>("#sizePicker");
    const colorPicker = document.querySelector<HTMLInputElement>("#colorPicker");

    // parse state from url
    const params = new URLSearchParams(window.location.hash.slice(1));
    const x = Number(params.get("x") || width.value);
    const y = Number(params.get("y") || height.value);
    const drawing = base64ToDrawing(params.get("data"));

    width.value = x.toString();
    height.value = y.toString();

    // initialize canvas
    const canvas = new PixelCanvas(table, colorPicker);
    canvas.resize(x, y);
    if (drawing) canvas.load(drawing);

    sizePicker.addEventListener("submit", e => {
        // resize drawing
        e.preventDefault();
        canvas.resize(Number(width.value), Number(height.value));
    });

    table.addEventListener(DRAWING_UPDATE.type, e => {
        const drawing = canvas.save();
        const base64 = drawingToBase64(drawing);
        const width = canvas.width();
        const height = canvas.height();

        const query: QueryParams = {
            x: width,
            y: height,
            data: base64,
        };

        // save params in url
        const params = objectToParams(query);
        window.location.hash = params.toString();
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

    function drawingToBase64(drawing: Drawing): string {

        const colors: string[] = [];
        // tslint:disable-next-line:forin
        for (const byColor in drawing) {
            const rows: string[] = [];
            const rowsByColor = drawing[byColor];
            // tslint:disable-next-line:forin
            for (const rowByColor in rowsByColor) {
                const columnsByRow = rowsByColor[rowByColor];
                rows.push(`${rowByColor}:${columnsByRow.join(",")}`);
            }
            colors.push(`${byColor}=${rows.join("+")}`);
        }

        const raw = colors.join("|");
        return LZString.compressToBase64(raw);
    }

    function base64ToDrawing(base64: string): Drawing {
        base64 = LZString.decompressFromBase64(base64 || "") || "";
        const drawing: Drawing = {};

        const byColors = base64.split("|");
        for (const byColor of byColors) {
            const [color, valueOfColor] = (byColor || "").split("=");
            drawing[color] = {};
            const byColorRows = (valueOfColor || "").split("+");
            for (const byColorRow of byColorRows) {
                const [row, valueOfRow] = (byColorRow || "").split(":");
                drawing[color][Number(row)] = (valueOfRow || "").split(",").map(Number);
            }
        }

        return drawing;
    }
})();
