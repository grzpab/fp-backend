import type { Transaction } from "sequelize";
import { pipe } from "fp-ts/lib/pipeable";
import { fold } from "fp-ts/lib/Either";
import { Task, map } from "fp-ts/lib/Task";
import { fromEither, chain, TaskEither } from "fp-ts/lib/TaskEither";
import { buildTransaction } from "./buildTransaction";
import { Inputs, decodeInputs } from "../effects/buildInputDecoder";
import type { DataAccessLayer } from "./sequelize";
import { Decoder, Errors } from "io-ts";

export type ControllerInput = Readonly<{
    inputs: Inputs<unknown, unknown, unknown>,
    dataAccessLayer: DataAccessLayer,
    getTime: () => number,
}>;

export type ControllerDependencies<P, Q, B> = Readonly<{
    decodedInputs: Inputs<P, Q, B>,
    dataAccessLayer: DataAccessLayer,
    getTime: () => number,
}>;

export type ControllerRecipe<P, Q, B, E, A> = Readonly<{
    paramsCodec: Decoder<unknown, P>,
    queryCodec: Decoder<unknown, Q>,
    bodyCodec: Decoder<unknown, B>,
    mapErrors: (errors: Errors) => E,
    buildError: (e: unknown) => E,
    isolationLevel: Transaction.ISOLATION_LEVELS,
    callback: (dependencies: ControllerDependencies<P, Q, B>) => (t: Transaction) => TaskEither<E, A>,
}>;

type HttpStatusCode = 200 | 201 | 204 | 400 | 403 | 404 | 500;

export type Controller = (input: ControllerInput) => Task<[HttpStatusCode, unknown]>;

export const buildController = <P, Q, B, E, A>(
    {
        paramsCodec,
        queryCodec,
        bodyCodec,
        mapErrors,
        buildError,
        isolationLevel,
        callback,
    }: ControllerRecipe<P, Q, B, E, A>
) => (
    { inputs, dataAccessLayer, getTime }: ControllerInput,
): Task<[HttpStatusCode, A | E]> => pipe(
    decodeInputs({
        paramsCodec,
        queryCodec,
        bodyCodec,
        mapErrors,
        inputs,
    }),
    fromEither,
    chain(( decodedInputs ) => buildTransaction(
        buildError,
        callback({ decodedInputs, dataAccessLayer, getTime }),
        isolationLevel,
        dataAccessLayer.sequelize,
    )),
    map(fold<E, A, [HttpStatusCode, A | E]>(
        (e) => [500, e],
        (a) => [200, a],
    )),
);
