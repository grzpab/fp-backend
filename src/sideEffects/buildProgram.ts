import { pipe } from "fp-ts/pipeable";
import { mapLeft } from "fp-ts/Either";
import { buildOptions } from "../effects/buildSequelizeOptions";
import { chain, fromEither, map as mapTE, TaskEither } from "fp-ts/TaskEither";
import { buildDataAccessLayer, buildSequelizeInstance } from "./sequelize";
import { buildServer } from "./buildServer";
import { healthCheckController } from "../effects/healthCheckController";
import { createUserController } from "../effects/createUserController";
import { updateUserController } from "../effects/updateUserController";
import { deleteUserController } from "../effects/deleteUserController";
import { findAllUsersController } from "../effects/findAllUsersController";
import { startServer } from "./restify";
import { configurationCodec } from "../codecs/configurationCodec";

export const buildProgram = (env: unknown, name: string): TaskEither<unknown, void> => pipe(
    configurationCodec.decode(env),
    mapLeft(String),
    fromEither,
    chain((configuration) => buildSequelizeInstance(
        configuration.RDB_DATABASE,
        configuration.RDB_USER,
        configuration.RDB_PASSWORD,
        buildOptions(configuration.RDB_HOST, configuration.RDB_PORT),
    )),
    chain(buildDataAccessLayer),
    mapTE((dataAccessLayer) => buildServer({
        name,
        dataAccessLayer,
        healthCheckController,
        createUserController,
        updateUserController,
        deleteUserController,
        findAllUsersController,
    })),
    chain(startServer(24001))
);
