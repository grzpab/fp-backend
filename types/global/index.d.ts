export {};

declare global {
    export type Unpromisify<T> = T extends Promise<infer R> ? R : never;

    export namespace R1NG {
        
    }
}

