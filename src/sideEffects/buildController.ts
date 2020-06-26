import { pipe } from "fp-ts/lib/pipeable";
import type { Either } from "fp-ts/lib/Either";
import type { Inputs } from "../effects/buildInputDecoder";
import { fromEither, chain } from "fp-ts/lib/TaskEither";
import { Transaction } from "sequelize/types";
import { buildTransaction } from "./buildTransaction";
import type { DataAccessLayer } from "./sequelize";

type ControlerInput = {
    inputs: Inputs<unknown, unknown, unknown>,
    dataAccessLayer: DataAccessLayer,
    getTime: () => number,
};

export type ControlerDependencies<P, Q, B> = {
    decodedInputs: Inputs<P, Q, B>,
    dataAccessLayer: DataAccessLayer,
    getTime: () => number,
};

export type ControlerRecipe<P, Q, B, E, A> = Readonly<{
    decodeInputs: (inputs: Inputs<unknown, unknown, unknown>) => Either<E, Inputs<P, Q, B>>,
    buildError: (controlerDependencies: ControlerDependencies<P, Q, B>) => (e: unknown) => E,
    callback: (controlerDependencies: ControlerDependencies<P, Q, B>) => (t: Transaction) => TaskEither<E, A>,
    isolationLevel: Transaction.ISOLATION_LEVELS,
}>;

export const buildControler = <P, Q, B, E, A>(
    { decodeInputs, buildError, callback, isolationLevel }: ControlerRecipe<P, Q, B, E, A>
) => (
    { inputs, dataAccessLayer, getTime }: ControlerInput,
): TaskEither<E, A> => pipe(
    decodeInputs(inputs),
    fromEither,
    chain(( decodedInputs ) => buildTransaction(
        buildError({ decodedInputs, dataAccessLayer, getTime }),
        callback({ decodedInputs, dataAccessLayer, getTime }),
        isolationLevel,
        dataAccessLayer.sequelize,
    ))
);
