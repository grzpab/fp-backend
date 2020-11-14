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
    chain(({ RDB_DATABASE, RDB_USER, RDB_PASSWORD, RDB_HOST, RDB_PORT, RDB_POOL_MIN, RDB_POOL_MAX }) => buildSequelizeInstance(
        RDB_DATABASE,
        RDB_USER,
        RDB_PASSWORD,
        buildOptions(RDB_HOST, RDB_PORT, RDB_POOL_MIN, RDB_POOL_MAX),
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
