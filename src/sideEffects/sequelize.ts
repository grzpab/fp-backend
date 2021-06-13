import { Options, Sequelize } from "sequelize";
import { tryCatch, TaskEither } from "fp-ts/lib/TaskEither";
import { userRepositoryBuilder } from "../repositories/buildUserRepository";
import { Reader } from "fp-ts/lib/Reader";
import { pipe } from "fp-ts/lib/pipeable";
import { Loggers } from "./buildLoggers";

export const buildSequelizeInstance = (
    RDB_DATABASE: string,
    RDB_USER: string,
    RDB_PASSWORD: string,
    options: Readonly<Options>,
): Reader<Loggers, TaskEither<string, Sequelize>> => ({ logger, teLogger }) => pipe(
    logger("Building Sequelize instance"),
    () => tryCatch(
        async () => {
            const sequelize = new Sequelize(
                RDB_DATABASE,
                RDB_USER,
                RDB_PASSWORD,
                options,
            );

            await sequelize.authenticate();

            return sequelize;
        },
        (reason) => `$Could not authenticate a Sequelize instance: ${String(reason)}.`
    ),
    teLogger(() => "Built Sequelize instance"),
);

const buildCheckConnection = (sequelize: Sequelize): TaskEither<string, void> => tryCatch(
    async (): Promise<void> => {
        await sequelize.query("SELECT 1");
    },
    (reason) => `Could not connect to the database anymore: ${String(reason)}`,
);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const buildDataAccessLayer = (sequelize: Sequelize) => tryCatch(
    async () => {
        const userRepository = userRepositoryBuilder(sequelize);

        await sequelize.sync();

        return {
            sequelize,
            checkConnection: buildCheckConnection(sequelize),
            userRepository,
        };
    },
    (reason) => `Could not build a DataAccessLayer instance: ${String(reason)}.`,
);

type DataAccessLayerTaskEither = ReturnType<typeof buildDataAccessLayer>;

export type GetTaskEitherRightType<T> = T extends TaskEither<unknown, infer R> ? R : never;

export type DataAccessLayer = GetTaskEitherRightType<DataAccessLayerTaskEither>;
