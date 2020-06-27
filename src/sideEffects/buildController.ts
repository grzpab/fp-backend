import { pipe } from "fp-ts/lib/pipeable";
import { Either, fold } from "fp-ts/lib/Either";
import { Task, map } from "fp-ts/lib/Task";
import { fromEither, chain, TaskEither } from "fp-ts/lib/TaskEither";
import { Transaction } from "sequelize/types";
import { buildTransaction } from "./buildTransaction";
import type { Inputs } from "../effects/buildInputDecoder";
import type { DataAccessLayer } from "./sequelize";

export type ControlerInput = {
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

type HttpStatusCode = 200 | 201 | 204 | 400 | 403 | 404 | 500;

export type Controler = (controlerInput: ControlerInput) => Task<[HttpStatusCode, unknown]>;

export const buildControler = <P, Q, B, E, A>(
    { decodeInputs, buildError, callback, isolationLevel }: ControlerRecipe<P, Q, B, E, A>
) => (
    { inputs, dataAccessLayer, getTime }: ControlerInput,
): Task<[HttpStatusCode, unknown]> => pipe(
    decodeInputs(inputs),
    fromEither,
    chain(( decodedInputs ) => buildTransaction(
        buildError({ decodedInputs, dataAccessLayer, getTime }),
        callback({ decodedInputs, dataAccessLayer, getTime }),
        isolationLevel,
        dataAccessLayer.sequelize,
    )),
    map(fold(
        (e) => [500, e] as [HttpStatusCode, unknown], 
        (a) => [200, a] as [HttpStatusCode, unknown],
    ))
);
