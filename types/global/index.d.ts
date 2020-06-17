import type { TaskEither as _TaskEither } from "fp-ts/lib/TaskEither";
import type { Sequelize, Transaction } from "sequelize/types";

declare global {
    export type Unpromisify<T> = T extends Promise<infer R> ? R : never;

    export type TaskEither<E, A> = _TaskEither<E, A>;

    export namespace R1NG {
        export type DataAccessLayer = Readonly<{
            checkConnection: TaskEither<string, void>;
            createUser: (transaction: Transaction, username: string, password: string) => TaskEither<string, boolean>;
            sequelize: Sequelize,
        }>;
    }
}
