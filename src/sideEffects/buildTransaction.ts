import type { Sequelize, Transaction } from "sequelize";
import { tryCatch, chain, fromEither, TaskEither } from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import type { ProgramError } from "../errors";

export const buildTransaction = <A>(
    buildError: (e: unknown) => ProgramError,
    callback: (t: Transaction) => TaskEither<ProgramError, A>,
    isolationLevel: Transaction.ISOLATION_LEVELS,
    sequelize: Sequelize,
): TaskEither<ProgramError, A> => pipe(
    tryCatch(
        async () => sequelize.transaction(
            { isolationLevel },
            async (transaction) => callback(transaction)(),
        ),
        buildError,
    ),
    chain(fromEither),
);
