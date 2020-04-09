import type { Either } from 'fp-ts/lib/Either';
import * as t from 'io-ts';

const configurationCodec = t.readonly(t.exact(t.type({
    RDB_HOST: t.string,
    RDB_PORT: t.string,
    RDB_USER: t.string,
    RDB_PASSWORD: t.string,
    RDB_DATABASE: t.string,
})));

namespace R1NG {
    export type Configuration = t.TypeOf<typeof configurationCodec>;
}

export const buildConfiguration = (env: NodeJS.ProcessEnv): Either<t.Errors, R1NG.Configuration> =>
    configurationCodec.decode(env);
