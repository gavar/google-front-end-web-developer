import {Vector2} from "$components";
import {LateUpdate} from "$systems";

export class CanvasScaler implements LateUpdate {

    public readonly size: Vector2 = {x: 0, y: 0};
    public readonly scale: Vector2 = {x: 1, y: 1};
    public readonly padding: Vector2 = {x: 0, y: 0};
    public canvas: HTMLCanvasElement;

    /** @inheritDoc */
    lateUpdate(deltaTime: number): void {
        const x = (window.innerWidth - this.padding.x) / this.size.x;
        const y = (window.innerHeight - this.padding.y) / this.size.y;
        this.scale.x = this.scale.y = Math.min(x, y, 1);
        this.canvas.width = this.size.x * this.scale.x;
        this.canvas.height = this.size.y * this.scale.y;
    }
}
