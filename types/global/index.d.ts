import type { TaskEither as _TaskEither } from "fp-ts/lib/TaskEither";

declare global {
    export type Unpromisify<T> = T extends Promise<infer R> ? R : never;

    export type TaskEither<E, A> = _TaskEither<E, A>;

    export namespace R1NG {
        export type DataAccessLayer = Readonly<{
            checkConnection: TaskEither<string, void>;
        }>;
    }
}
