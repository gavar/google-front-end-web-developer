import {Rect, Transform, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Draw2D, Gizmo2D} from "$systems";
import {Dictionary, Mutable} from "@syntax";

export type TerrainImage = HTMLImageElement;
export type LayerImages = Dictionary<number, Dictionary<number, TerrainImage>>

export class Terrain2D implements Component, Draw2D, Gizmo2D {

    private images: LayerImages = {};
    private layers: TerrainLayer2D[] = [];

    /** @inheritDoc */
    public readonly actor?: Actor;

    /** Transform of this terrain instance. */
    public readonly transform: Transform;

    /** @inheritDoc */
    public order: number;

    /** @inheritDoc */
    public gizmo?: boolean;

    /** @inheritDoc */
    awake(this: Mutable<this>) {
        this.transform = this.actor.require(Transform);
    }

    /** Total width of the terrain. */
    get width(): number {
        return this.size.x * this.tile.width;
    }

    /** Total height of the terrain. */
    get height(): number {
        return this.size.y * this.tile.height;
    }

    /**
     * Rect of the single tile.
     * {@link Rect#xMin} {@link Rect#yMin} define offset from top-left corner of the image by X and Y axes respectively.
     * {@link Rect#width} {@link Rect#height} define size of the tile by X and Y axes respectively.
     */
    public readonly tile: Rect = Rect.minMax(0, 0, 0, 0);

    /**
     * Set rectangle of the single tile.
     * @param x - tile offset by 'X' axis from the top-left corner of the image.
     * @param y - tile offset by 'Y' axis from the top-left corner of the image.
     * @param width - tile width.
     * @param height - tile height.
     */
    setTileRect(x: number, y: number, width: number, height: number): Rect {
        const {tile} = this;
        tile.xMin = x;
        tile.xMax = x + width;
        tile.yMin = y;
        tile.yMax = y + height;
        return tile;
    }

    /**
     * Size of the terrain grid.
     * Number of tiles by X and Y.
     */
    public readonly size: Vector2 = {x: 0, y: 0};

    /** Set number of terrain tiles by X and Y. */
    setGridSize(width: number, height: number): Vector2 {
        this.size.x = width;
        this.size.y = height;

        // trim layers
        for (const layer of this.actor.components)
            if (layer instanceof TerrainLayer2D)
                layer.trim(width, height);

        return this.size;
    }

    /**
     * Calculate 'X' position of the tile
     * @param x - index of the tile by 'X' axis.
     */
    positionX(x: number): number {
        return this.transform.position.x + this.tile.width * x;
    }

    /**
     * Calculate 'Y' position of the tile
     * @param y - index of the tile by 'Y' axis.
     */
    positionY(y: number): number {
        return this.transform.position.y + this.tile.height * y;
    }

    /**
     * Get index of the tile, by evaluating 'X' position.
     * @param x - position by 'X' axis.
     */
    rowByPosX(x: number): number {
        return (x - this.transform.position.x) / this.tile.width;
    }

    /**
     * Get index of the tile, by evaluating 'Y' position.
     * @param y - position by 'Y' axis.
     */
    colByPosY(y: number): number {
        return (y - this.transform.position.y) / this.tile.height;
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
        const {tile, transform} = this;
        const {position} = transform;
        const width = tile.width;
        const height = tile.height;

        const offsetX = position.x;
        const offsetY = position.y;
        const images = this.mergeLayers();

        for (const y in images) {
            const row = images[y];
            for (const x in row) {
                ctx.drawImage(
                    row[x],
                    offsetX + (x as any) * width,
                    offsetY + (y as any) * height,
                );
            }
        }
    }

    /** @inheritDoc */
    drawGizmo2D(ctx: CanvasRenderingContext2D): void {
        const {size, tile} = this;
        const {position} = this.transform;
        const offsetX = position.x + tile.xMin;
        const offsetY = position.y + tile.yMin;
        ctx.strokeStyle = "blue";
        for (let i = 0; i <= size.x; i++) {
            ctx.beginPath();
            ctx.moveTo(this.positionX(i) + offsetX, this.positionY(0) + offsetY);
            ctx.lineTo(this.positionX(i) + offsetX, this.positionY(size.y) + offsetY);
            ctx.stroke();
        }
        for (let i = 0; i <= size.y; i++) {
            ctx.beginPath();
            ctx.moveTo(this.positionX(0) + offsetX, this.positionY(i) + offsetY);
            ctx.lineTo(this.positionX(size.x) + offsetX, this.positionY(i) + offsetY);
            ctx.stroke();
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

    /** Set value of the {@link order} property. */
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
        else this.images[y] && delete this.images[y][x];
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
        return (x - this.terrain.transform.position.x) / this.terrain.tile.width;
    }

    /**
     * Get column of the tile, by evaluating 'Y' position.
     * @param y - position by 'Y' axis.
     */
    colByPosY(y: number): number {
        return (y - this.terrain.transform.position.y) / this.terrain.tile.height;
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
