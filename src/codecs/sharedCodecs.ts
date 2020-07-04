import * as t from "io-ts";
import { date } from 'io-ts-types/lib/date'
import { either } from "fp-ts/lib/Either";

export const buildRetCodec = <T extends t.Props>(props: T): t.ReadonlyC<t.ExactC<t.TypeC<T>>> =>
    t.readonly(t.exact(t.type(props)));

export const buildRepCodec = <T extends t.Props>(props: T): t.ReadonlyC<t.ExactC<t.PartialC<T>>> =>
    t.readonly(t.exact(t.partial(props)));

export const emptyCodec = buildRetCodec({});

export const NumberFromDate = new t.Type(
    'NumberFromDate',
    t.number.is,
    (input, context) => either.chain(
        date.validate(input, context),
        (d) => t.success(d.getDate())
    ),
    Date,
);
