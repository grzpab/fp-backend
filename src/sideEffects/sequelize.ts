import { Options, Sequelize } from "sequelize";
import { tryCatch } from "fp-ts/lib/TaskEither";

export const buildSequelizeInstance = (
    RDB_DATABASE: string,
    RDB_USER: string,
    RDB_PASSWORD: string,
    options: Options,
): TaskEither<string, Sequelize> => {
    return tryCatch(async () => {
        const sequelize = new Sequelize(
            RDB_DATABASE,
            RDB_USER,
            RDB_PASSWORD,
            options,
        );
    
        await sequelize.authenticate();
    
        return sequelize;
    }, () => "Could not authenticate a Sequelize instance.");
};

const buildCheckConnection = (sequelize: Sequelize): TaskEither<string, void> => tryCatch(
    async (): Promise<void> => {
        await sequelize.query("SELECT 1");
    },
    () => "Could not connect to the database anymore."
);

export const buildDataAccessLayer = (sequelize: Sequelize): TaskEither<string, R1NG.DataAccessLayer> => {
    return tryCatch(
        async () => {
            await sequelize.sync();

            return {
                checkConnection: buildCheckConnection(sequelize),
            };
        },
        () => "Could not build a DataAccessLayer instance",
    );
};
