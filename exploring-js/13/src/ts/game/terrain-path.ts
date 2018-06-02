import {TerrainImage, TerrainLayer2D, Vector2} from "$components";
import {Random} from "$game";

/** Terrain path generator. */
export class TerrainPath {

    private static readonly directions: Array<Readonly<Vector2>> = [
        Vector2.up,
        Vector2.down,
        Vector2.left,
        Vector2.right,
    ];

    private toY: number;
    private now: Vector2 = {x: 0, y: 0};
    private from: Readonly<Vector2>;
    private ways: Array<Readonly<Vector2>> = [];
    private direction: Readonly<Vector2>;

    /** Layer to use for path rendering. */
    public layer: TerrainLayer2D;

    /** Image to use for path. */
    public image: TerrainImage;

    /**
     * Generate random path from point to a given Y line.
     * @param from - path starting position.
     * @param toY - path destination Y axis.
     * @returns path finish position.
     */
    public generate(from: Vector2, toY: number): Vector2 {
        this.toY = toY;
        this.from = from;
        this.now.x = from.x;
        this.now.y = from.y;
        this.layer.clear();
        this.direction = toY > from.y ? Vector2.up : Vector2.down;

        // draw image on current tile
        this.moveBy(Vector2.zero);

        // first 2 moves always in given direction
        let direction = this.direction;
        this.moveBy(direction);
        while (direction && this.now.y !== toY - 2 * this.direction.y) {
            this.moveBy(direction);
            direction = this.next();
        }

        // last move to final tile
        this.moveBy(this.direction);

        return {
            x: this.now.x,
            y: this.now.y,
        };
    }

    private next(): Readonly<Vector2> {
        try {
            // select possible ways
            for (const direction of TerrainPath.directions)
                if (this.canMoveBy(direction))
                    this.ways.push(direction);

            // exit if not further way
            if (this.ways.length < 1)
                return;

            const index = Random.rangeInt(0, this.ways.length);
            return this.ways[index];

        } finally {
            this.ways.length = 0;
        }
    }

    private moveBy(delta: Readonly<Vector2>) {
        this.now.x += delta.x;
        this.now.y += delta.y;
        this.layer.setTile(this.now.x, this.now.y, this.image);
    }

    private canMoveBy(delta: Readonly<Vector2>): boolean {
        if (!this.canMoveByX(delta.x))
            return false;

        if (!this.canMoveByY(delta.y))
            return false;

        const x = this.now.x + delta.x;
        const y = this.now.y + delta.y;

        // already has tile?
        if (this.layer.getTile(x, y))
            return false;

        // avoid having squares
        if (delta.x)
            if (this.layer.getTile(x, y - this.direction.y))
                return false;

        return true;
    }

    private canMoveByY(delta: number): boolean {
        const y = this.now.y + delta;

        // down?
        if (this.toY > this.from.y)
            return delta >= 0 && y < this.toY;

        // up?
        if (this.toY < this.from.y)
            return delta <= 0 && y > this.toY;
    }

    private canMoveByX(delta: number): boolean {
        const {layer} = this;
        const {size} = layer.terrain;
        const x = this.now.x + delta;
        return x >= 0 && x < size.x;
    }
}

