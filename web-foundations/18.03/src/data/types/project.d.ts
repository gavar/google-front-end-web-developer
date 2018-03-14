import {Company} from "./company";
import {Post} from "./post";
import {Technology} from "./technology";

export interface Project {
    title: string;
    url?: string;
    dateFrom: Date;
    dateTo: Date;
    company?: Company | Company[];
    role: string,
    technologies: Technology[];
    post: Post;
}
