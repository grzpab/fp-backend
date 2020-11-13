import { pipe } from "fp-ts/lib/pipeable";
import { map, mapLeft, fold, Either } from "fp-ts/lib/Either";
import { fromEither, chain, map as mapTE } from "fp-ts/lib/TaskEither";
import { buildConfiguration } from "./effects/buildConfig";
import { buildSequelizeInstance, buildDataAccessLayer } from "./sideEffects/sequelize";
import { buildOptions } from "./effects/buildSequelizeOptions";
import { buildServer } from "./sideEffects/buildServer";
import { startServer } from "./sideEffects/restify";
import { healthCheckController } from "./effects/healthCheckController";
import { createUserController } from "./effects/createUserController";
import { findAllUsersController } from "./effects/findAllUsersController";
import { updateUserController } from "./effects/updateUserController";
import { deleteUserController } from "./effects/deleteUserController";

const { env } = process;

const program = pipe(
    buildConfiguration(env),
    map((configuration) => ({
        options: buildOptions(configuration.RDB_HOST, configuration.RDB_PORT),
        configuration,
    })),
    mapLeft(String),
    fromEither,
    chain(({ options, configuration }) => buildSequelizeInstance(
        configuration.RDB_DATABASE,
        configuration.RDB_USER,
        configuration.RDB_PASSWORD,
        options,
    )),
    chain(buildDataAccessLayer),
    mapTE((dataAccessLayer) => buildServer({
        name: "r1ng",
        dataAccessLayer,
        healthCheckController,
        createUserController,
        updateUserController,
        deleteUserController,
        findAllUsersController,
    })),
    chain(startServer(24001))
);

const programFinishedCallback = <A, B>(either: Either<A, B>) => pipe(
    either,
    fold(
        (error) => { console.log(`Connection unsuccessful: ${String(error)}`); },
        () => { console.log("Connection successful"); }
    )
);

// eslint-disable-next-line @typescript-eslint/no-floating-promises
program().then(programFinishedCallback);
