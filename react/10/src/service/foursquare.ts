const client = "A50JL40VHVZD2BRPEXEXASKRWFD03QKDHG0XDJSFMNNHOVBE";
const secret = "HRQH3Q15T4L5ZJ2GBPFQ0NHKMTLU5H40QKU3TEFJPAMQ2MOW";

/**
 * Finds a venue match by its location and name.
 * @see https://developer.foursquare.com/docs/api/venues/search
 * @param name - name of the venue.
 * @param lat - venue latitude.
 * @param lng - venue longitude.
 */
export async function search(name: string, lat: number, lng: number): Promise<FourSquareResponse<FourSquareVenuesBody>> {
    const url = userless("/venues/search",
        `intent=match`,
        `ll=${`${lat},${lng}`}`,
        `name=${name}`,
    );

    const response = await fetch(url);
    return json(response);
}

/**
 * Get likes for the venue.
 * @see https://developer.foursquare.com/docs/api/venues/likes
 */
export async function likes(venue: string): Promise<FourSquareResponse<FourSquareLikesBody>> {
    const url = userless(`/venues/${venue}/likes`);
    const response = await fetch(url);
    return json(response);
}

/**
 * Construct user-less request url.
 * @param path - endpoint path.
 * @param params - query params.
 */
function userless(path: string, ...params: string[]): string {
    const baseUrl = "https://api.foursquare.com/v2";
    params.push(
        `client_id=${client}`,
        `client_secret=${secret}`,
        `v=${v()}`,
    );
    return `${baseUrl}${path}?${params.join("&")}`;
}

export interface FourSquareResponse<T = {}> {
    meta: FourSquareMeta,
    body: T
}

export interface FourSquareVenuesBody {
    venues: FourSquareVenue[]
}

export interface FourSquareLikesBody {
    likes: {
        count: number,
    }
}

export interface FourSquareVenue {
    id: string,
    name: string,
}

export interface FourSquareMeta {
    code: number;
    errorType: string;
    errorDetail: string;
}

async function json<T = any>(res: Response): Promise<FourSquareResponse<T>> {
    const {meta, response} = await res.json();
    return {meta, body: response};
}

function v(): string {
    const date = new Date();
    let DD = date.getDate();
    let MM = date.getMonth();
    const YYYY = date.getFullYear();
    return [
        YYYY,
        MM < 10 ? 0 : null, MM,
        DD < 10 ? 0 : null, DD,
    ].join("");
}
