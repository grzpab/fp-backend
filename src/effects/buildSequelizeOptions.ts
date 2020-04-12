import type { Options } from "sequelize";

export const buildOptions = (RDB_HOST: string, RDB_PORT: number): Options => ({
    host: RDB_HOST,
    port: RDB_PORT,
    dialect: "mysql",
    pool: {
        min: 0,
        max: 10,
    },
    logging: true,
});
