/**
 * A 2D Rectangle defined by X and Y position, width and height.
 */
export class Rect {
    /** Creates a rectangle from min/max coordinate values. */
    public static minMax(xMin: number, yMin: number, xMax: number, yMax: number): Rect {
        const rect = new Rect();
        rect.xMin = xMin;
        rect.xMax = xMax;
        rect.yMin = yMin;
        rect.yMax = yMax;
        return rect;
    }

    /** Minimum X coordinate of the rectangle. */
    xMin: number;

    /** Maximum X coordinate of the rectangle. */
    xMax: number;

    /** Minimum Y coordinate of the rectangle. */
    yMin: number;

    /** Maximum Y coordinate of the rectangle. */
    yMax: number;

    /** Width of the rectangle, measured from the X position. */
    get width(): number {
        return Math.abs(this.xMax - this.xMin);
    }

    /** Height of the rectangle, measured from the Y position. */
    get height(): number {
        return Math.abs(this.yMax - this.yMin);
    }
}
