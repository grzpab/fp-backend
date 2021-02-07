import { v4 } from "uuid";
import { Sequelize, Model, ModelAttributes, ModelAttributeColumnOptions, DataTypes, Transaction } from "sequelize";
import { tryCatch, TaskEither, map, chainEitherKW } from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/function";
import { fromNullable, map as mapOption } from "fp-ts/lib/Option";
import { fromOption, left, right } from "fp-ts/Either";
import { buildNotFoundError, buildProgramError, ProgramError } from "../errors";
import { getAttributes } from "./getAttributes";

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

type UserCreationAttributes = Readonly<{
    id: string;
    username: string;
}>;

type UserAttributes = UserCreationAttributes & Readonly<{
    createdAt: string;
    updatedAt: string;
}>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const userRepositoryBuilder = (sequelize: Sequelize) => {
    const attributes: ModelAttributes = {
        id: buildUuidColumn({
            allowNull: false,
            primaryKey: true,
            defaultValue: () => v4(),
        }),
        username: buildStringColumn(255, { allowNull: false }),
    };

    const model = sequelize.define<Model<UserAttributes, UserCreationAttributes>>("user", attributes, {
        tableName: "users",
        timestamps: true,
    });

    const findOne = (transaction: Transaction, id: string) : TaskEither<ProgramError, UserAttributes>  =>
        pipe(
            tryCatch(
                async () => model.findOne({
                    where: {
                        id,
                    },
                    transaction,
                }),
                (reason) => buildNotFoundError(`Could not find a user: ${String(reason)}.`),
            ),
            map(fromNullable),
            map(mapOption(getAttributes)),
            chainEitherKW(fromOption(() => buildNotFoundError("Could not find a user"))),
        );

    const findAll = (transaction: Transaction, offset: number, limit: number): TaskEither<ProgramError, ReadonlyArray<UserAttributes>> =>
        pipe(
            tryCatch(
                async () => model.findAll({
                    offset,
                    limit,
                    transaction
                }),
                (reason) => buildNotFoundError(`Could not find users ${String(reason)}.`),
            ),
            map(instances => instances.map(getAttributes)),
        );

    const create = (transaction: Transaction, username: string) : TaskEither<ProgramError, UserAttributes> => 
        pipe(
            tryCatch(
                async () => model.create(
                    {
                        id: v4(), // TODO pass it from somewhere
                        username
                    },
                    { transaction },
                ),
                (reason) => buildProgramError(`Could not create a user: ${String(reason)}.`),
            ),
            map(getAttributes),
        )
        ;

    const update = (transaction: Transaction, id: string, username: string) : TaskEither<ProgramError, void> => tryCatch(
        async () => {
            await model.update(
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
            async () => model.destroy({
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
