import { pipe } from "fp-ts/lib/pipeable";
import { map, getOrElse } from "fp-ts/lib/TaskEither";
import { of, Task } from "fp-ts/lib/Task";
import { ControlerInput } from "../sideEffects/buildController";

export const healthCheckControler = ({ dataAccessLayer }: ControlerInput): Task<[200|500, undefined]> => pipe(
    dataAccessLayer.checkConnection,
    map(() => [200, undefined]),
    getOrElse(() => of([500, undefined]))
);
