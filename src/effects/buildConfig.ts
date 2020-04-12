import type { Either } from "fp-ts/lib/Either";
import type { Errors } from "io-ts";
import { configurationCodec, Configuration } from "../codecs/configurationCodec";

export const buildConfiguration = (env: Readonly<NodeJS.ProcessEnv>): Either<Errors, Configuration> =>
    configurationCodec.decode(env);
