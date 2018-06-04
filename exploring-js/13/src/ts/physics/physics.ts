export class Physics2D {

    /**
     * Determines whether two capsules intersects.
     * Calculations use capsule center line and its width (radius).
     */
    public static intersectCapsuleCapsule(
        x11: number, y11: number, x12: number, y12: number, r1: number,
        x21: number, y21: number, x22: number, y22: number, r2: number,
    ): boolean {
        // distance between lines less than sum of radius
        const r = r1 + r2;
        return Physics2D.distanceLineLineSqr(
            x11, y11, x12, y12,
            x21, y21, x22, y22,
        ) <= r * r;
    }

    /**
     * Calculate square of the shortest distance between two segments.
     */
    public static distanceLineLineSqr(
        x11: number, y11: number, x12: number, y12: number,
        x21: number, y21: number, x22: number, y22: number,
    ): number {
        // http://geomalgorithms.com/a07-_distance.html
        // https://www.john.geek.nz/2009/03/code-shortest-distance-between-any-two-line-segments/
        const EPSILON = 0.00000001;

        const dx21 = x12 - x11;
        const dy21 = y12 - y11;
        const dx41 = x22 - x21;
        const dy41 = y22 - y21;
        const dx13 = x11 - x21;
        const dy13 = y11 - y21;

        const a = dx21 * dx21 + dy21 * dy21;
        const b = dx21 * dx41 + dy21 * dy41;
        const c = dx41 * dx41 + dy41 * dy41;
        const d = dx21 * dx13 + dy21 * dy13;
        const e = dx41 * dx13 + dy41 * dy13;
        const D = a * c - b * b;

        let sc, sN, sD = D;
        let tc, tN, tD = D;

        if (D < EPSILON) {
            sN = 0.0;
            sD = 1.0;
            tN = e;
            tD = c;
        } else {
            sN = (b * e - c * d);
            tN = (a * e - b * d);
            if (sN < 0.0) {
                sN = 0.0;
                tN = e;
                tD = c;
            }
            else if (sN > sD) {
                sN = sD;
                tN = e + b;
                tD = c;
            }
        }

        if (tN < 0) {
            tN = 0;
            if (-d < 0) sN = 0;
            else if (-d > a) sN = sD;
            else {
                sN = -d;
                sD = a;
            }
        }
        else if (tN > tD) {
            tN = tD;
            if ((-d + b) < 0.0)
                sN = 0;
            else if ((-d + b) > a)
                sN = sD;
            else {
                sN = (-d + b);
                sD = a;
            }
        }

        if (Math.abs(sN) < EPSILON) sc = 0.0;
        else sc = sN / sD;
        if (Math.abs(tN) < EPSILON) tc = 0.0;
        else tc = tN / tD;

        const dx = dx13 + (sc * dx21) - (tc * dx41);
        const dy = dy13 + (sc * dy21) - (tc * dy41);
        return dx * dx + dy * dy;
    }
}
