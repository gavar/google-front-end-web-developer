import {Company} from "./company";
import {Post} from "./post";
import {StoreApp} from "./store-app";
import {Technology} from "./technology";

export interface Project {
    title: string;
    url?: string;
    dateFrom: Date;
    dateTo: Date;
    company?: Company | Company[];
    role: string,
    apps?: StoreApp[]
    technologies: Technology[];
    post: Post;
}
