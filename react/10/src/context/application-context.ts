import {Map} from "$google/maps";
import React from "react";
import {PlaceService} from "../service";

export const ApplicationContext = React.createContext<ApplicationContextProps>({
    map: null,
    placeService: null,
});

export interface ApplicationContextProps {
    map: Map,
    placeService: PlaceService;
}
