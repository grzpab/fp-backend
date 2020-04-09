import { pipe } from 'fp-ts/lib/pipeable';
import { map, mapLeft, fold } from "fp-ts/lib/Either";
import { fromEither, chain } from 'fp-ts/lib/TaskEither'
import { buildConfiguration } from "./effects/buildConfig";
import { buildSequelizeInstance, buildDataAccessLayer } from "./sideEffects/sequelize";
import { buildOptions } from './effects/buildSequelizeOptions';

const { env } = process;

const program = pipe(
    buildConfiguration(env),
    map((configuration) => ({
        options: buildOptions(configuration.RDB_HOST, 3306),
        configuration,
    })),
    mapLeft(String),
    fromEither,
    chain(({ options, configuration }) => {
        return buildSequelizeInstance(
            configuration.RDB_DATABASE,
            configuration.RDB_USER,
            configuration.RDB_PASSWORD,
            options,
        )
    }),
    chain(buildDataAccessLayer),
    chain((dal) => dal.checkConnection),
);

program().then((either) => fold(
    console.log,
    () => { console.log('Connection successful')}
)(either));
