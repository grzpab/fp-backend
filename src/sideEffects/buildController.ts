import { pipe } from "fp-ts/lib/pipeable";
import { Either, fold } from "fp-ts/lib/Either";
import { Task, map } from "fp-ts/lib/Task";
import { fromEither, chain, TaskEither } from "fp-ts/lib/TaskEither";
import { Transaction } from "sequelize/types";
import { buildTransaction } from "./buildTransaction";
import type { Inputs } from "../effects/buildInputDecoder";
import type { DataAccessLayer } from "./sequelize";

export type ControllerInput = {
    inputs: Inputs<unknown, unknown, unknown>,
    dataAccessLayer: DataAccessLayer,
    getTime: () => number,
};

export type ControllerDependencies<P, Q, B> = {
    decodedInputs: Inputs<P, Q, B>,
    dataAccessLayer: DataAccessLayer,
    getTime: () => number,
};

export type ControllerRecipe<P, Q, B, E, A> = Readonly<{
    decodeInputs: (inputs: Inputs<unknown, unknown, unknown>) => Either<E, Inputs<P, Q, B>>,
    buildError: (dependencies: ControllerDependencies<P, Q, B>) => (e: unknown) => E,
    callback: (dependencies: ControllerDependencies<P, Q, B>) => (t: Transaction) => TaskEither<E, A>,
    isolationLevel: Transaction.ISOLATION_LEVELS,
}>;

type HttpStatusCode = 200 | 201 | 204 | 400 | 403 | 404 | 500;

export type Controller = (input: ControllerInput) => Task<[HttpStatusCode, unknown]>;

export const buildController = <P, Q, B, E, A>(
    { decodeInputs, buildError, callback, isolationLevel }: ControllerRecipe<P, Q, B, E, A>
) => (
    { inputs, dataAccessLayer, getTime }: ControllerInput,
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
