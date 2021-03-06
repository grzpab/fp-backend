import type { Sequelize, Transaction } from "sequelize";
import { tryCatch, chain, fromEither, TaskEither, fromIO } from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import type { ProgramError } from "../errors";
import type { Loggers } from "./buildLoggers";
import { ReaderTaskEither } from "fp-ts/ReaderTaskEither";

export const buildTransaction = <A>(
    buildError: (e: unknown) => ProgramError,
    callback: (t: Transaction) => TaskEither<ProgramError, A>,
    isolationLevel: Transaction.ISOLATION_LEVELS,
    sequelize: Sequelize,
): ReaderTaskEither<Loggers, ProgramError, A> => ({ logger, teLogger }) => {
    return pipe(
        fromIO(logger("Started transaction.")),
        chain(() => tryCatch(
            async () => sequelize.transaction(
                { isolationLevel },
                async (transaction) => callback(transaction)(),
            ),
            buildError,
        )),
        chain(fromEither),
        teLogger(() => "Finished transaction"),
    );
};
