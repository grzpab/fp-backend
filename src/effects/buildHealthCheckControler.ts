import { pipe } from "fp-ts/lib/pipeable";
import { map, getOrElse, TaskEither } from "fp-ts/lib/TaskEither";
import { of, Task } from "fp-ts/lib/Task";

export const buildHealthCheckControler = (checkConnection: TaskEither<string, void>): Task<number> => pipe(
    checkConnection,
    map(() => 200),
    getOrElse(() => of(500))
);
