/**
 * A 2D Rectangle defined by X and Y position, width and height.
 */
class Rect {
    /** Creates a rectangle from min/max coordinate values. */
    static minMax(xMin, yMin, xMax, yMax) {
        const rect = new Rect();
        rect.xMin = xMin;
        rect.xMax = xMax;
        rect.yMin = yMin;
        rect.yMax = yMax;
        return rect;
    }

    /** Width of the rectangle, measured from the X position. */
    get width() {
        return Math.abs(this.xMax - this.xMin);
    }

    /** Height of the rectangle, measured from the Y position. */
    get height() {
        return Math.abs(this.yMax - this.yMin);
    }
}

class Vector2 {
    /**
     * Gradually change towards a destination value over time.
     * @param now - current value (modified by this function).
     * @param to - destination value to achieve.
     * @param velocity - object to store velocity.
     * @param smoothTime - approx time of achieving destination value.
     * @param deltaTime - time since last call of this function.
     * @param velocityLimit - maximum velocity.
     * @see https://github.com/Unity-Technologies/UnityCsReference/blob/11bcfd801fccd2a52b09bb6fd636c1ddcc9f1705/Runtime/Export/Vector2.cs#L201
     */
    static smooth(now, to, velocity, smoothTime, deltaTime, velocityLimit = Number.POSITIVE_INFINITY) {
        const o = 2 / smoothTime;
        const x = o * deltaTime;
        const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        let dx = now.x - to.x;
        let dy = now.y - to.y;
        // clamp
        const max = velocityLimit * smoothTime;
        const sqr = dx * dx + dy * dy;
        if (sqr > max * max) {
            const length = Math.sqrt(sqr);
            dx = dx / length * max;
            dy = dy / length * max;
        }
        let tx = now.x - dx;
        let ty = now.y - dy;
        let t;
        t = (velocity.x + o * dx) * deltaTime;
        velocity.x = (velocity.x - o * t) * e;
        let rx = tx + (dx + t) * e;
        t = (velocity.y + o * dy) * deltaTime;
        velocity.y = (velocity.y - o * t) * e;
        let ry = ty + (dy + t) * e;
        // prevent overshooting
        const dx1 = to.x - now.x;
        const dy1 = to.y - now.y;
        const dx2 = rx - to.x;
        const dy2 = ry - to.y;
        const dot = dx1 * dx2 + dy1 * dy2;
        if (dot > 0) {
            rx = to.x;
            ry = to.y;
            velocity.x = (rx - to.x) / deltaTime;
            velocity.y = (ry - to.y) / deltaTime;
        }
        // apply
        now.x = rx;
        now.y = ry;
    }

    /** Calculate length of a vector - square root of (x * x + y * y). */
    static magnitude(vector) {
        const {x, y} = vector;
        return Math.sqrt(x * x + y * y);
    }

    /**
     * Limit vector's magnitude to a given value.
     * @param vector - vector to clamp.
     * @param limit - vector length limit.
     */
    static clampMagnitude(vector, limit) {
        const {x, y} = vector;
        if (x * x + y * y > limit * limit) {
            Vector2.normalize(vector);
            vector.x *= limit;
            vector.y *= limit;
        }
    }

    /**
     * Set given vector magnitude to 1.
     * @param vector - vector to normalize.
     */
    static normalize(vector) {
        const {x, y} = vector;
        const length = Math.sqrt(x * x + y * y);
        vector.x /= length;
        vector.y /= length;
    }

    /**
     * Calculate unsigned angle between two vectors in degrees.
     * Smaller of the two possible angles between the two vectors is used.
     */
    static angle(a, b) {
        const f1 = Math.sqrt(a.x * a.x + a.y * a.y); // length of A
        const f2 = Math.sqrt(b.x * b.x + b.y * b.y); // length of B
        const dot = (a.x / f1) * (b.x / f2) + (a.y / f1) * (b.y / f2);
        return Math.acos(dot) / Math.PI * 180;
    }
}

Vector2.zero = {x: 0, y: 0};
Vector2.one = {x: 1, y: 1};
Vector2.up = {x: 0, y: 1};
Vector2.down = {x: 0, y: -1};
Vector2.left = {x: -1, y: 0};
Vector2.right = {x: 1, y: 0};

/**
 * Defines transformation matrix of an actor.
 */
class Transform {
    constructor() {
        /** World position of an actor. */
        this.position = {x: 0, y: 0, z: 0};
        /** World Euler rotation of the transform. */
        this.rotation = {x: 0, y: 0, z: 0};
        /** World scale of an actor. */
        this.scale = {x: 1, y: 1, z: 1};
    }

    /** Set value of {@link scale}. */
    setScale(x, y, z) {
        this.scale.x = x;
        this.scale.y = y;
        if (arguments.length > 2)
            this.scale.z = z;
    }
}

/**
 * Component for defining actor layer.
 * Actor should only have a single instance of {@link Layer} component.
 */
class Layer {
    constructor() {
        /**
         * Layer of the actor, in range: [0;32)
         * Layers may be used for render ordering, collision intersection matrix, etc.
         */
        this.value = 0;
        /** Bitmask of of the {@link value}. */
        this.mask = 1 << this.value;
    }

    /**
     * Set layer of the actor.
     * @param value - layer value to set.
     */
    set(value) {
        this.value = value || 0;
        this.mask = 1 << this.value;
    }
}

class FPS {
    /** @inheritDoc */
    awake() {
        this.actor.require(Layer).set(10000);
    }

    /** @inheritDoc */
    draw2D(ctx, deltaTime) {
        const {scale} = Canvas.active.transform;
        const fps = Math.ceil(1 / deltaTime).toFixed(0);
        try {
            ctx.save();
            ctx.font = "20px serif";
            ctx.fillStyle = "white";
            ctx.scale(1 / scale.x, 1 / scale.y);
            ctx.translate(ctx.canvas.width - 22, ctx.canvas.height - 5);
            ctx.fillText(fps, 0, 0);
        }
        finally {
            ctx.restore();
        }
    }
}

/** Draws an image on a canvas. */
class Sprite {
    constructor() {
        /** Additional translation to transform coordinates. */
        this.translate = {x: 0, y: 0};
        /** Defines origin offset from the transform position multiplied by image size. */
        this.offset = {x: 0, y: 0};
        /** Rotation pivot of the image. */
        this.pivot = {x: .5, y: .5};
        /** Opacity of the image. */
        this.opacity = 1;
    }

    /** Set value of {@link pivot}. */
    setPivot(x, y) {
        this.pivot.x = x;
        this.pivot.y = y;
    }

    /** Set value of {@link scale}. */
    setScale(x, y) {
        this.transform.setScale(x, y);
    }

    /** Set value of {@link offset}. */
    setOffset(x, y) {
        this.offset.x = x;
        this.offset.y = y;
    }

    /**
     * X point of the sprite OOBB.
     * @param pivot - pivot point of the image, defaults to {@link pivot}.
     */
    x(pivot) {
        if (arguments.length < 1)
            pivot = this.pivot.x;
        const {image} = this;
        const {offset, translate} = this;
        const {position, rotation, scale} = this.transform;
        const size = (image && image.width || 0) * Math.abs(scale.x);
        // TODO: consider rotation
        return position.x
            + translate.x
            + offset.x * size
            + pivot * size;
    }

    /**
     * Y point of the sprite OOBB.
     * @param pivot - pivot point of the image, defaults to {@link pivot}.
     */
    y(pivot) {
        if (arguments.length < 1)
            pivot = this.pivot.y;
        const {image} = this;
        const {offset, translate} = this;
        const {position, rotation, scale} = this.transform;
        const size = (image && image.height || 0) * Math.abs(scale.y);
        // TODO: consider rotation
        return position.y
            + translate.y
            + offset.y * size
            + pivot * size;
    }

    /** @inheritDoc */
    awake() {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    draw2D(ctx) {
        const {image} = this;
        if (!image)
            return;
        const {offset, translate, pivot, opacity, filter} = this;
        const {position, rotation, scale} = this.transform;
        const {width, height} = image;
        const w = width * Math.abs(scale.x);
        const h = height * Math.abs(scale.y);
        try {
            ctx.save();
            ctx.filter = filter;
            ctx.globalAlpha = opacity;
            ctx.translate(position.x, position.y);
            ctx.translate(translate.x, translate.y);
            ctx.translate(offset.x * width, offset.y * height);
            const dx = pivot.x * w;
            const dy = pivot.y * h;
            ctx.translate(dx, dy);
            ctx.rotate(rotation.z * Math.PI / 180);
            ctx.scale(scale.x >= 0 ? 1 : -1, scale.y >= 0 ? 1 : -1);
            ctx.drawImage(image, -dx, -dy, w, h);
        }
        finally {
            ctx.restore();
        }
    }

    /** @inheritDoc */
    drawGizmo2D(ctx) {
        const {image} = this;
        if (image) {
            this.drawOOBB(ctx, image);
        }
    }

    /**
     * Draw image as object oriented bounding box (OOBB).
     */
    drawOOBB(ctx, image) {
        const {translate, offset, pivot} = this;
        const {position, rotation, scale} = this.transform;
        const {width, height} = image;
        const w = width * Math.abs(scale.x);
        const h = height * Math.abs(scale.y);
        try {
            ctx.save();
            // position point
            ctx.translate(position.x, position.y);
            ctx.translate(translate.x, translate.y);
            ctx.strokeStyle = "black";
            Gizmo2D.x(ctx, 0, 0, 10);
            // origin point
            ctx.translate(offset.x * width, offset.y * height);
            // pivot point
            const dx = pivot.x * w;
            const dy = pivot.y * h;
            ctx.translate(dx, dy);
            ctx.strokeStyle = "blue";
            Gizmo2D.x(ctx, 0, 0, 10);
            ctx.rotate(rotation.z * Math.PI / 180);
            // object oriented bounding box
            ctx.strokeStyle = "red";
            ctx.scale(scale.x >= 0 ? 1 : -1, scale.y >= 0 ? 1 : -1);
            ctx.strokeRect(-dx, -dy, w, h);
        }
        finally {
            ctx.restore();
        }
    }
}

/**
 * Moves transform by given velocity.
 */
class Motor {
    constructor() {
        /** Velocity vector of the motor. */
        this.velocity = {x: 0, y: 0};
    }

    /** @inheritDoc */
    awake() {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    update(deltaTime) {
        this.transform.position.x += this.velocity.x * deltaTime;
        this.transform.position.y += this.velocity.y * deltaTime;
    }
}

class Terrain2D {
    constructor() {
        this.images = {};
        this.layers = [];
        /**
         * Rect of the single tile.
         * {@link Rect#xMin} {@link Rect#yMin} define offset from top-left corner of the image by X and Y axes respectively.
         * {@link Rect#width} {@link Rect#height} define size of the tile by X and Y axes respectively.
         */
        this.tile = Rect.minMax(0, 0, 0, 0);
        /**
         * Size of the terrain grid.
         * Number of tiles by X and Y.
         */
        this.size = {x: 0, y: 0};
    }

    /** @inheritDoc */
    awake() {
        this.transform = this.actor.require(Transform);
    }

    /** Total width of the terrain. */
    get width() {
        return this.size.x * this.tile.width;
    }

    /** Total height of the terrain. */
    get height() {
        return this.size.y * this.tile.height;
    }

    /**
     * Set rectangle of the single tile.
     * @param x - tile offset by 'X' axis from the top-left corner of the image.
     * @param y - tile offset by 'Y' axis from the top-left corner of the image.
     * @param width - tile width.
     * @param height - tile height.
     */
    setTileRect(x, y, width, height) {
        const {tile} = this;
        tile.xMin = x;
        tile.xMax = x + width;
        tile.yMin = y;
        tile.yMax = y + height;
        return tile;
    }

    /** Set number of terrain tiles by X and Y. */
    setGridSize(width, height) {
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
    positionX(x) {
        return this.transform.position.x + this.tile.width * x;
    }

    /**
     * Calculate 'Y' position of the tile
     * @param y - index of the tile by 'Y' axis.
     */
    positionY(y) {
        return this.transform.position.y + this.tile.height * y;
    }

    /**
     * Get index of the tile, by evaluating 'X' position.
     * @param x - position by 'X' axis.
     */
    rowByPosX(x) {
        return (x - this.transform.position.x) / this.tile.width;
    }

    /**
     * Get index of the tile, by evaluating 'Y' position.
     * @param y - position by 'Y' axis.
     */
    colByPosY(y) {
        return (y - this.transform.position.y) / this.tile.height;
    }

    /**
     * Raycast to terrain to get tile by given position.
     * @param x - position by X axis.
     * @param y - position by Y axis.
     */
    raycast(x, y) {
        x = Math.floor(this.rowByPosX(x));
        y = Math.floor(this.colByPosY(y));
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            const image = layer.getTile(x, y);
            if (image)
                return image;
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
    createLayer() {
        const layer = new TerrainLayer2D(this);
        this.layers.push(layer);
        return layer;
    }

    /** @inheritDoc */
    draw2D(ctx) {
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
                ctx.drawImage(row[x], offsetX + x * width, offsetY + y * height);
            }
        }
    }

    /** @inheritDoc */
    drawGizmo2D(ctx) {
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

    mergeLayers() {
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

class TerrainLayer2D {
    constructor(terrain) {
        /** @private */
        this.images = {};
        this.order = 0;
        this.terrain = terrain;
    }

    /** Compare terrain layers by {@link TerrainLayer2D#order}. */
    static compareByOrder(a, b) {
        return a.order - b.order;
    }

    /** Set value of the {@link order} property. */
    setOrder(order) {
        this.order = order || 0;
        this.terrain.sort();
    }

    /**
     * Set image by given row / column coordinates.
     * @param x - index of the column.
     * @param y - index of the row.
     * @param image - image to set.
     */
    setTile(x, y, image) {
        if (image)
            (this.images[y] = this.images[y] || {})[x] = image;
        else
            this.images[y] && delete this.images[y][x];
    }

    /**
     * Get tile image by given row / column coordinates.
     * @param x - index of the column.
     * @param y - index of the row.
     * @returns image by the given row / column coordinates.
     */
    getTile(x, y) {
        const row = this.images[y];
        return row && row[x];
    }

    /**
     * Set image for every on a given row.
     * @param y - index of the row ('Y' axis).
     * @param image - image to render on a given row.
     */
    setTileRow(y, image) {
        const {size} = this.terrain;
        const row = this.images[y] = this.images[y] || {};
        for (let x = 0; x < size.x; x++)
            row[x] = image;
    }

    /**
     * Get row of the tile, by evaluating 'X' position.
     * @param x - position by 'X' axis.
     */
    rowByPosX(x) {
        return (x - this.terrain.transform.position.x) / this.terrain.tile.width;
    }

    /**
     * Get column of the tile, by evaluating 'Y' position.
     * @param y - position by 'Y' axis.
     */
    colByPosY(y) {
        return (y - this.terrain.transform.position.y) / this.terrain.tile.height;
    }

    /**
     * Trim layer to given dimensions.
     * @param width - max width of the layer.
     * @param height - max height of the layer.
     */
    trim(width, height) {
        for (const y in this.images) {
            // delete excessive rows
            if (y >= height) {
                delete this.images[y];
                continue;
            }
            // delete excessive columns
            for (const x in this.images[y])
                if (x >= width)
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

/** Component which loads resources. */
class Resources {
    /** @inheritDoc */
    awake() {
        this.cache = {};
        this.images = {};
        this.listeners = [];
    }

    /**
     * Load a resource by a given name.
     * @param name - name of the resource to load.
     * @param callback - callback to invoke when loading completes.
     * @param target - target to pass as this to the callback.
     * @return promise with given resource.
     */
    load(name, callback, target) {
        // invoke callback or schedule
        if (callback) {
            if (this.cache.hasOwnProperty(name))
                callback.apply(target, this.cache[name]);
            else
                this.listeners.push({name, func: callback, target});
        }
        // check image cache
        let image = this.images[name];
        if (image)
            return image;
        // create image
        this.images[name] = image = new Image();
        image.name = name;
        image.addEventListener("load", this);
        image.addEventListener("error", this);
        // start loading
        image.src = `${this.baseUrl}/${name}`;
        return image;
    }

    /** @inheritDoc */
    handleEvent(evt) {
        const image = evt.currentTarget;
        image.removeEventListener("load", this);
        image.removeEventListener("error", this);
        // save result
        const name = image.name;
        switch (evt.type) {
            case "load":
                this.cache[name] = [void 0, image];
                break;
            case "error":
                this.cache[name] = [evt.error, void 0];
                break;
        }
        // callbacks
        for (let i = 0; i < this.listeners.length; i++) {
            // find matching listener
            const listener = this.listeners[i];
            if (listener.name !== name)
                continue;
            if (Bag.removeAt(this.listeners, i))
                i--;
            // invoke
            listener.func.apply(listener.target, this.cache[name]);
        }
    }
}

// 'Resources' defaults
Resources.prototype.baseUrl = "assets";

/**
 * Component containing canvas, scaling it to fit the screen.
 */
class Canvas {
    constructor() {
        /** How much units canvas has by 'X' and 'Y'. */
        this.size = {x: 0, y: 0};
    }

    /** @inheritDoc */
    awake() {
        this.transform = this.actor.require(Transform);
    }

    /** @inheritDoc */
    lateUpdate(deltaTime) {
        const {scale} = this.transform;
        const {size, element} = this;
        // scale down canvas to fit the screen
        const x = (window.innerWidth) / size.x;
        const y = (window.innerHeight) / size.y;
        scale.x = scale.y = Math.min(x, y, 1);
        element.width = size.x * scale.x;
        element.height = size.y * scale.y;
    }
}
