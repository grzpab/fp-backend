import { pipe } from "fp-ts/lib/pipeable";
import { Either } from "fp-ts/lib/Either";
import { Inputs } from "../effects/buildInputDecoder";
import { fromEither, chain } from "fp-ts/lib/TaskEither";
import { Transaction } from "sequelize/types";
import { buildTransaction } from "./buildTransaction";

type ControlerInput = {
    inputs: Inputs<unknown, unknown, unknown>,
    dataAccessLayer: R1NG.DataAccessLayer,
    getTime: () => number,
};

export type ControlerDependencies<P, Q, B> = {
    decodedInputs: Inputs<P, Q, B>,
    dataAccessLayer: R1NG.DataAccessLayer,
    getTime: () => number,
};

export const buildControler = <P, Q, B, E, A>(
    decodeInputs: (inputs: Inputs<unknown, unknown, unknown>) => Either<E, Inputs<P, Q, B>>,
    buildError: (controlerDependencies: ControlerDependencies<P, Q, B>) => (e: unknown) => E,
    callback: (controlerDependencies: ControlerDependencies<P, Q, B>) => (t: Transaction) => TaskEither<E, A>,
    isolationLevel: Transaction.ISOLATION_LEVELS,
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
