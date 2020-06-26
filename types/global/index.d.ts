import type { TaskEither as _TaskEither } from "fp-ts/lib/TaskEither";
import type { Sequelize, Transaction } from "sequelize/types";

declare global {

    export type TaskEither<E, A> = _TaskEither<E, A>;
}
