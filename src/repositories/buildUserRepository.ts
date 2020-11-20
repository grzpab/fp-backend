import { v4 } from "uuid";
import { Sequelize, Model, ModelAttributes, ModelAttributeColumnOptions, DataTypes, Transaction } from "sequelize";
import { tryCatch, TaskEither, map, chainEitherKW } from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/function";
import { fromNullable } from "fp-ts/lib/Option";
import { fromOption, left, right } from "fp-ts/Either";
import { buildNotFoundError, buildProgramError, ProgramError } from "../errors";

type Options = Pick<ModelAttributeColumnOptions, "allowNull" | "defaultValue" | "primaryKey">;

export const buildUuidColumn = (options: Options): ModelAttributeColumnOptions => Object.assign(
    {
        type : DataTypes.UUID,
    },
    options,
);

export const buildStringColumn = (length: number, options: Options): ModelAttributeColumnOptions => Object.assign(
    {
        type : DataTypes.STRING(length),
    },
    options,
);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const userRepositoryBuilder = (sequelize: Sequelize) => {
    class User extends Model {
        public id!: string;
        public username!: string;
        public readonly createdAt!: Date;
        public readonly updatedAt!: Date;
    }

    const attributes: ModelAttributes = {
        id: buildUuidColumn({
            allowNull: false,
            primaryKey: true,
            defaultValue: () => v4(),
        }),
        username: buildStringColumn(255, { allowNull: false }),
    };

    User.init(attributes, {
        sequelize,
        tableName: "users",
        timestamps: true,
    });

    const findOne = (transaction: Transaction, id: string) : TaskEither<ProgramError, User>  =>
        pipe(
            tryCatch(
                async () => User.findOne({
                    where: {
                        id,
                    },
                    transaction,
                }),
                (reason) => buildNotFoundError(`Could not find a user: ${String(reason)}.`),
            ),
            map(fromNullable),
            chainEitherKW(fromOption(() => buildNotFoundError("Could not find a user"))),
        );

    const findAll = (transaction: Transaction, offset: number, limit: number): TaskEither<ProgramError, ReadonlyArray<User>> => tryCatch(
        async () => User.findAll({
            offset,
            limit,
            transaction
        }),
        (reason) => buildNotFoundError(`Could not find users ${String(reason)}.`),
    );

    const create = (transaction: Transaction, username: string) : TaskEither<ProgramError, User> => tryCatch(
        async () => User.create(
            { username },
            { transaction },
        ),
        (reason) => buildProgramError(`Could not create a user: ${String(reason)}.`),
    );

    const update = (transaction: Transaction, id: string, username: string) : TaskEither<ProgramError, void> => tryCatch(
        async () => {
            await User.update(
                { username },
                {
                    where: {
                        id,
                    },
                    transaction,
                },
            );
        },
        (reason) => buildProgramError(`Could not create a user: ${String(reason)}.`),
    );

    const destroy = (transaction: Transaction, id: string): TaskEither<ProgramError, void>  => pipe(
        tryCatch(
            async () => User.destroy({
                where: {
                    id,
                },
                transaction,
            }),
            (reason) => buildProgramError(`Could not destroy a user: ${String(reason)}.`),
        ),
        chainEitherKW((numberOfDestroyedRows) => (numberOfDestroyedRows !== 1 ?
            left(buildProgramError(`Deleted ${numberOfDestroyedRows} rows`)) :
            right(undefined)),
        )
    );

    return {
        findOne,
        findAll,
        create,
        update,
        destroy,
    };
};
