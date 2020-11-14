import { pipe } from "fp-ts/lib/pipeable";
import type { Errors, Decoder } from "io-ts";
import { Do } from "fp-ts-contrib/lib/Do";
import { either, Either, mapLeft } from "fp-ts/lib/Either";

export type Inputs<P, Q, B> = Readonly<{
    params: P,
    query: Q,
    body: B,
}>;

type InputsDecoders<P, Q, B, E> = Readonly<{
    paramsCodec: Decoder<unknown, P>,
    queryCodec: Decoder<unknown, Q>,
    bodyCodec: Decoder<unknown, B>,
    mapErrors: (errors: Errors) => E,
    inputs: Inputs<unknown, unknown, unknown>
}>;

export const decodeInputs = <P, Q, B, E>(
    {
        paramsCodec,
        queryCodec,
        bodyCodec,
        mapErrors,
        inputs,
    }: InputsDecoders<P, Q, B, E>
): Either<E, Inputs<P, Q, B>> => {
    const do3 = Do(either)
        .bind("params", paramsCodec.decode(inputs.params))
        .bind("query", queryCodec.decode(inputs.query))
        .bind("body", bodyCodec.decode(inputs.body))
        .done();

    return pipe(
        do3,
        mapLeft(mapErrors),
    );
};
