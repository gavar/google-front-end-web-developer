import {LatLngLiteral} from "$google/maps";

export interface Place {
    key: string;
    icon: string;
    name: string;
    photo: string
    phone: string;
    rating: number;
    reviews: number;
    address: Address;
    website: string;
    vicinity: string;
    location: LatLngLiteral;
    operating: boolean;
    updateTime: number;
    foursquare?: FourSquarePlace;
    detailed?: boolean;
}

export interface Address {
    country?: string;
    city?: string;
    street?: string;
}

export interface FourSquarePlace {
    found: boolean;
    venue?: string;
    likes?: number;
}
