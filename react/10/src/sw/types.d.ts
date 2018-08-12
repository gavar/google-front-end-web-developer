/// <reference path="../../node_modules/typescript/lib/lib.es2016.d.ts" />
/// <reference path="../../node_modules/typescript/lib/lib.webworker.d.ts" />

declare interface WorkerLocation {
    username: string,
    password: string,
    searchParams: URLSearchParams;
}
