import * as restify from "restify";
import { taskify, TaskEither } from "fp-ts/lib/TaskEither";

export const startServer = (port: number) => (server: restify.Server) : TaskEither<unknown, void> =>
    taskify<unknown, void>(callback => {
        server.listen(port, callback);
    })();
