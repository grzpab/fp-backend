import { Sequelize, Transaction } from "sequelize/types";
import { tryCatch, chain, fromEither, TaskEither } from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";

export const buildTransaction = <E, A>(
    buildError: (e: unknown) => E,
    callback: (t: Transaction) => TaskEither<E, A>,
    isolationLevel: Transaction.ISOLATION_LEVELS,
    sequelize: Sequelize,
): TaskEither<E, A> => pipe(
    tryCatch(
        () => sequelize.transaction(
            { isolationLevel },
            async (transaction) => callback(transaction)(),
        ),
        buildError,
    ),
    chain(fromEither),
);
