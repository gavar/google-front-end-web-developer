import {TaskCallback} from "./task-callback";
import {TaskInfo} from "./task-info";

type AwaitEmitter = (done?: TaskCallback) => NodeJS.EventEmitter;
type AwaitPromise = (done?: TaskCallback) => Promise<any>;
type AwaitCallback = (done: TaskCallback) => void;
export type TaskFunction = AwaitEmitter | AwaitPromise | AwaitCallback;
export type Task = TaskFunction & TaskInfo;
