import { IO } from "fp-ts/IO";
import { withLogger } from "logging-ts/lib/IO";
import { taskEither } from "fp-ts/TaskEither";

export type Logger = (s: unknown) => IO<void>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const buildLoggers = (logger: Logger) => {
    const teLogger = withLogger(taskEither)(logger);

    return {
        logger,
        teLogger,
    };
};

export type Loggers = ReturnType<typeof buildLoggers>;
