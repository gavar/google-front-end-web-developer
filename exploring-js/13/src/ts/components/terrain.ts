import {Transform, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Draw2D} from "$systems";
import {Dictionary, Mutable} from "@syntax";

export type TerrainImage = HTMLImageElement;
export type LayerImages = Dictionary<number, Dictionary<number, TerrainImage>>

export class Terrain2D implements Component, Draw2D {

    private images: LayerImages = {};
    private layers: TerrainLayer2D[] = [];
    private _size: Vector2 = {x: 0, y: 0};
    private _tile: Vector2 = {x: 0, y: 0};

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Whether to merge layers before rendering. */
    public merge: boolean;

    /** Transform of this terrain instance. */
    public readonly transform: Transform;

    /** @inheritDoc */
    public readonly order: number;

    /** @inheritDoc */
    awake() {
        (this as Mutable<this>).transform = this.actor.require(Transform);
    }

    /** Offset of drawing starting point. */
    public offset: Vector2 = {x: 0, y: 0};

    /** Total width of the terrain. */
    get width(): number {
        return this._size.x * this._tile.x;
    }

    /** Total height of the terrain. */
    get height(): number {
        return this._size.y * this._tile.y;
    }

    /** Get size of the single tile. */
    get tile(): Vector2 {
        return this._tile;
    }

    /**
     * Get size of the terrain grid.
     * Number of tiles by X and Y.
     */
    get size(): Vector2 {
        return this._size;
    }

    /** Set size of the single tile. */
    setTileSize(width: number, height: number): Vector2 {
        this._tile.x = width;
        this._tile.y = height;
        return this._tile;
    }

    /** Set number of terrain tiles by X and Y. */
    setGridSize(width: number, height: number): Vector2 {
        this._size.x = width;
        this._size.y = height;

        // trim layers
        for (const layer of this.actor.components)
            if (layer instanceof TerrainLayer2D)
                layer.trim(width, height);

        return this._size;
    }

    /**
     * Calculate 'X' position of the tile
     * @param x - index of the tile by 'X' axis.
     */
    positionX(x: number): number {
        return this.transform.position.x + this._tile.x * x;
    }

    /**
     * Calculate 'Y' position of the tile
     * @param y - index of the tile by 'Y' axis.
     */
    positionY(y: number): number {
        return this.transform.position.y + this._tile.y * y;
    }

    /**
     * Get index of the tile, by evaluating 'X' position.
     * @param x - position by 'X' axis.
     */
    rowByPosX(x: number): number {
        return (x - this.transform.position.x) / this._tile.x;
    }

    /**
     * Get index of the tile, by evaluating 'Y' position.
     * @param y - position by 'Y' axis.
     */
    colByPosY(y: number): number {
        return (y - this.transform.position.y) / this._tile.y;
    }

    /**
     * Raycast to terrain to get tile by given position.
     * @param x - position by X axis.
     * @param y - position by Y axis.
     */
    raycast(x: number, y: number): TerrainImage {
        x = Math.floor(this.rowByPosX(x));
        y = Math.floor(this.colByPosY(y));
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            const image = layer.getTile(x, y);
            if (image) return image;
        }
    }

    /**
     * Sort layers by {@link TerrainLayer2D#order}.
     * Done automatically by {@link TerrainLayer2D#setOrder}
     */
    sort() {
        this.layers.sort(TerrainLayer2D.compareByOrder);
    }

    /** Create new layer instance. */
    createLayer(): TerrainLayer2D {
        const layer = new TerrainLayer2D(this);
        this.layers.push(layer);
        return layer;
    }

    /** @inheritDoc */
    draw2D(ctx: CanvasRenderingContext2D): void {
        const {tile, offset, transform} = this;
        const {position} = transform;

        const offsetX = position.x + offset.x;
        const offsetY = position.y + offset.y;
        const images = this.merge ? this.mergeLayers() : this.images;

        for (const y in images) {
            const row = images[y];
            for (const x in row) {
                ctx.drawImage(
                    row[x],
                    offsetX + (x as any) * tile.x,
                    offsetY + (y as any) * tile.y,
                );
            }
        }
    }

    private mergeLayers(): LayerImages {
        TerrainLayer2D.prototype.clear.apply(this);
        const {images} = this;
        for (const layer of this.layers) {
            for (const y in layer.images) {
                const row = images[y] || {};
                Object.assign(row, layer.images[y]);
                images[y] = row;
            }
        }
        return images;
    }
}

// Terrain2D defaults
Terrain2D.prototype.merge = true;

export class TerrainLayer2D {

    /** Compare terrain layers by {@link TerrainLayer2D#order}. */
    public static compareByOrder(a: TerrainLayer2D, b: TerrainLayer2D): number {
        return a.order - b.order;
    }

    /** @private */
    images: LayerImages = {};

    /** Terrain to which this layer belongs. */
    public readonly terrain: Terrain2D;

    /** Sorting order of the layer within terrain. */
    public readonly order: number;

    constructor(terrain: Terrain2D) {
        this.order = 0;
        this.terrain = terrain;
    }

    setOrder(order: number) {
        (this as Mutable<this>).order = order || 0;
        this.terrain.sort();
    }

    /**
     * Set image by given row / column coordinates.
     * @param x - index of the column.
     * @param y - index of the row.
     * @param image - image to set.
     */
    setTile(x: number, y: number, image?: TerrainImage) {
        if (image) (this.images[y] = this.images[y] || {})[x] = image;
        else this.images[y] && (this.images[y][x] = void 0);
    }

    /**
     * Get tile image by given row / column coordinates.
     * @param x - index of the column.
     * @param y - index of the row.
     * @returns image by the given row / column coordinates.
     */
    getTile(x: number, y: number): TerrainImage {
        const row = this.images[y];
        return row && row[x];
    }

    /**
     * Set image for every on a given row.
     * @param y - index of the row ('Y' axis).
     * @param image - image to render on a given row.
     */
    setTileRow(y: number, image: TerrainImage) {
        const {size} = this.terrain;
        const row = this.images[y] = this.images[y] || {};
        for (let x = 0; x < size.x; x++)
            row[x] = image;
    }

    /**
     * Get row of the tile, by evaluating 'X' position.
     * @param x - position by 'X' axis.
     */
    rowByPosX(x: number): number {
        return (x - this.terrain.transform.position.x) / this.terrain.tile.x;
    }

    /**
     * Get column of the tile, by evaluating 'Y' position.
     * @param y - position by 'Y' axis.
     */
    colByPosY(y: number): number {
        return (y - this.terrain.transform.position.y) / this.terrain.tile.y;
    }

    /**
     * Trim layer to given dimensions.
     * @param width - max width of the layer.
     * @param height - max height of the layer.
     */
    trim(width: number, height: number) {
        for (const y in this.images) {

            // delete excessive rows
            if (y as any >= height) {
                delete this.images[y];
                continue;
            }

            // delete excessive columns
            for (const x in this.images[y])
                if (x as any >= width)
                    delete this.images[y][x];
        }
    }

    /**
     * Remove all images from a layer.
     */
    clear() {
        for (const y in this.images) {
            const row = this.images[y];
            for (const x in row)
                delete row[x];
        }
    }
}
