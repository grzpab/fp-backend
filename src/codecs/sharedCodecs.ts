import * as t from "io-ts";

export const buildRetCodec = <T extends t.Props>(props: T): t.ReadonlyC<t.ExactC<t.TypeC<T>>> =>
    t.readonly(t.exact(t.type(props)));

export const buildRepCodec = <T extends t.Props>(props: T): t.ReadonlyC<t.ExactC<t.PartialC<T>>> =>
    t.readonly(t.exact(t.partial(props)));

export const emptyCodec = buildRetCodec({});
