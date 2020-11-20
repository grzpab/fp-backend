import type { Transaction } from "sequelize";
import { pipe } from "fp-ts/lib/pipeable";
import { fold } from "fp-ts/lib/Either";
import { Task, map } from "fp-ts/lib/Task";
import { fromEither, chain, TaskEither } from "fp-ts/lib/TaskEither";
import { buildTransaction } from "./buildTransaction";
import { Inputs, decodeInputs } from "../effects/buildInputDecoder";
import type { DataAccessLayer } from "./sequelize";
import type { Decoder } from "io-ts";
import type { ProgramError } from "../errors";
import { buildError } from "../effects/buildError";
import { mapErrors } from "../codecs/sharedCodecs";

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

export type ControllerRecipe<P, Q, B, A> = Readonly<{
    paramsCodec: Decoder<unknown, P>,
    queryCodec: Decoder<unknown, Q>,
    bodyCodec: Decoder<unknown, B>,
    isolationLevel: Transaction.ISOLATION_LEVELS,
    callback: (dependencies: ControllerDependencies<P, Q, B>) => (t: Transaction) => TaskEither<ProgramError, A>,
}>;

type HttpStatusCode = 200 | 201 | 204 | 400 | 403 | 404 | 500;

export type Controller = (input: ControllerInput) => Task<[HttpStatusCode, unknown]>;

export const buildController = <P, Q, B, A>(
    {
        paramsCodec,
        queryCodec,
        bodyCodec,
        isolationLevel,
        callback,
    }: ControllerRecipe<P, Q, B, A>
) => (
    { inputs, dataAccessLayer, getTime }: ControllerInput,
): Task<[200, A] | [500, ProgramError]> => pipe(
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
    map(fold<ProgramError, A, [200, A] | [500, ProgramError]>(
        (e) => [500, e],
        (a) => [200, a],
    )),
);
