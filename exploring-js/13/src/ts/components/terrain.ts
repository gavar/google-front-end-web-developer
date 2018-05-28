import {Transform, Vector2} from "$components";
import {Actor, Component} from "$engine";
import {Draw2D} from "$systems";
import {Dictionary} from "@syntax";

export type TerrainImage = HTMLImageElement;
export type TerrainLayer = Dictionary<number, Dictionary<number, TerrainImage>>

export class Terrain2D implements Component, Draw2D {

    private layer: TerrainLayer = {};
    private transform: Transform;

    private _size: Vector2 = {x: 0, y: 0};
    private _tile: Vector2 = {x: 0, y: 0};

    /** @inheritDoc */
    readonly actor?: Actor;

    /** Default offset to apply to a position calculations. */
    offset: Vector2 = {x: 0, y: 0};

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

    /**
     * Calculate 'X' position of the tile
     * @param x - index of the tile by 'X' axis.
     */
    positionX(x: number): number {
        return this.offset.x + this.transform.position.x + this._tile.x * x;
    }

    /**
     * Calculate 'Y' position of the tile
     * @param y - index of the tile by 'Y' axis.
     */
    positionY(y: number): number {
        return this.offset.y + this.transform.position.y + this._tile.y * y;
    }

    /**
     * Get index of the tile, by evaluating 'X' position.
     * @param x - position by 'X' axis.
     */
    tileX(x: number): number {
        return (x - this.offset.x - this.transform.position.x) / this._tile.x;
    }

    /**
     * Get index of the tile, by evaluating 'Y' position.
     * @param y - position by 'Y' axis.
     */
    tileY(y: number): number {
        return (y - this.offset.y - this.transform.position.y) / this._tile.y;
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

        for (const y in this.layer) {
            // delete excessive rows
            if (y as any >= height) {
                delete this.layer[y];
                continue;
            }
            // delete excessive columns
            for (const x in this.layer[y])
                if (x as any >= width)
                    delete this.layer[y][x];
        }

        return this._size;
    }

    /**
     * Set image for every on a given row.
     * @param y - index of the row ('Y' axis).
     * @param image - image to render on a given row.
     */
    setImageRow(y: number, image: TerrainImage) {
        const row = this.layer[y] = this.layer[y] || {};
        for (let x = 0; x < this._size.x; x++)
            row[x] = image;
    }

    /** @inheritDoc */
    awake() {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    draw2D(context: CanvasRenderingContext2D): void {
        const tile = this._tile;
        const {position} = this.transform;

        for (const y in this.layer)
            for (const x in this.layer[y]) {
                const image = this.layer[y][x];
                context.drawImage(
                    image,
                    position.x + (x as any) * tile.x,
                    position.y + (y as any) * tile.y,
                );
            }
    }
}
