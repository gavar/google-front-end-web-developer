import {csharp} from "./technologies";
import {Project} from "./types";

export const MyCountryAR: Project = {
    title: "My Country",
    dateFrom: new Date(2017, 9),
    dateTo: new Date(2017, 10),
    technologies: [csharp],
    post: {
        image: "",
        content: `<p>project goes info here</p>`,
    }
};

export default [
    MyCountryAR,
]
