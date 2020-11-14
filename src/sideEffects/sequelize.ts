import { Options, Sequelize } from "sequelize";
import { tryCatch, TaskEither } from "fp-ts/lib/TaskEither";
import { userRepositoryBuilder } from "../repositories/buildUserRepository";

export const buildSequelizeInstance = (
    RDB_DATABASE: string,
    RDB_USER: string,
    RDB_PASSWORD: string,
    options: Readonly<Options>,
): TaskEither<string, Sequelize> => tryCatch(async () => {
    const sequelize = new Sequelize(
        RDB_DATABASE,
        RDB_USER,
        RDB_PASSWORD,
        options,
    );

    await sequelize.authenticate();

    return sequelize;
}, (err) => `$Could not authenticate a Sequelize instance: ${String(err)}.`);

const buildCheckConnection = (sequelize: Sequelize): TaskEither<string, void> => tryCatch(
    async (): Promise<void> => {
        await sequelize.query("SELECT 1");
    },
    () => "Could not connect to the database anymore."
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
    () => "Could not build a DataAccessLayer instance",
);

type DataAccessLayerTaskEither = ReturnType<typeof buildDataAccessLayer>;

export type GetTaskEitherRightType<T> = T extends TaskEither<unknown, infer R> ? R : never;

export type DataAccessLayer = GetTaskEitherRightType<DataAccessLayerTaskEither>;
