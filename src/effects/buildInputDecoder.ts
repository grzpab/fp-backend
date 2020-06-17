import { pipe } from "fp-ts/lib/pipeable";
import type { Errors, Decoder } from "io-ts";
import { Do } from "fp-ts-contrib/lib/Do";
import { either, Either, mapLeft } from "fp-ts/lib/Either";

type InputsDecoders<P, Q, B, E> = Readonly<{
    paramsCodec: Decoder<unknown, P>,
    queryCodec: Decoder<unknown, Q>,
    bodyCodec: Decoder<unknown, B>,
    mapErrors: (errors: Errors) => E, 
}>;

export type Inputs<P, Q, B> = Readonly<{
    params: P,
    query: Q,
    body: B,
}>;

export const decodeInputs = <P, Q, B, E>({ paramsCodec, queryCodec, bodyCodec, mapErrors }: InputsDecoders<P, Q, B, E>) => (
    { params, query, body }: Inputs<unknown, unknown, unknown>
): Either<E, Inputs<P, Q, B>> => {
    const do3 = Do(either)
        .bind("params", paramsCodec.decode(params))
        .bind("query", queryCodec.decode(query))
        .bind("body", bodyCodec.decode(body))
        .done();

    return pipe(
        do3,
        mapLeft(mapErrors),
    );
};
