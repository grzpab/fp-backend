import * as t from "io-ts";
import { IntFromString } from "io-ts-types/lib/IntFromString";
import { buildRetCodec } from "./sharedCodecs";

export const configurationCodec = buildRetCodec({
    RDB_HOST: t.string,
    RDB_PORT: IntFromString,
    RDB_USER: t.string,
    RDB_PASSWORD: t.string,
    RDB_DATABASE: t.string,
    RDB_POOL_MIN: IntFromString,
    RDB_POOL_MAX: IntFromString,
});
