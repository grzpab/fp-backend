import type { Options } from "sequelize";

export const buildOptions = (
    RDB_HOST: string,
    RDB_PORT: number,
    RDB_POOL_MIN: number,
    RDB_POOL_MAX: number,
): Options => ({
    host: RDB_HOST,
    port: RDB_PORT,
    dialect: "mysql",
    pool: {
        min: RDB_POOL_MIN,
        max: RDB_POOL_MAX,
    },
    logging: false,
});
