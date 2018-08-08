import {LatLngLiteral} from "$google/maps";

export interface Place {
    key: string;
    icon: string;
    name: string;
    phone: string;
    rating: number;
    website: string;
    vicinity: string;
    location: LatLngLiteral;
    operating: boolean;

    updateTime: number;
    details?: boolean;
}
