import * as t from "io-ts";
import { IntFromString } from "io-ts-types/lib/IntFromString";
import { buildRetCodec } from "./sharedCodecs";

export const configurationCodec = buildRetCodec({
    RDB_HOST: t.string,
    RDB_PORT: IntFromString,
    RDB_USER: t.string,
    RDB_PASSWORD: t.string,
    RDB_DATABASE: t.string,
});

export type Configuration = t.TypeOf<typeof configurationCodec>;
