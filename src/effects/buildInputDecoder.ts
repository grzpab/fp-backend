import type { Errors, Decoder } from "io-ts";
import { Do } from "fp-ts-contrib/lib/Do";
import { either, Either } from "fp-ts/lib/Either";

type InputsDecoders<P, Q, B> = Readonly<{
    paramsCodec: Decoder<unknown, P>,
    queryCodec: Decoder<unknown, Q>,
    bodyCodec: Decoder<unknown, B>,
}>;

export type Inputs<P, Q, B> = Readonly<{
    params: P,
    query: Q,
    body: B,
}>;

export const decodeInputs = <P, Q, B>({ paramsCodec, queryCodec, bodyCodec }: InputsDecoders<P, Q, B>) => (
    { params, query, body }: Inputs<unknown, unknown, unknown>
): Either<Errors, Inputs<P, Q, B>> => Do(either)
    .bind("params", paramsCodec.decode(params))
    .bind("query", queryCodec.decode(query))
    .bind("body", bodyCodec.decode(body))
    .done();
