import { v4 } from "uuid";
import { Sequelize, Model, ModelAttributes, ModelAttributeColumnOptions, DataTypes, Transaction } from "sequelize";
import { tryCatch, TaskEither } from "fp-ts/lib/TaskEither";

type Options = Pick<ModelAttributeColumnOptions, "allowNull" | "defaultValue" | "primaryKey">;

export const buildUuidColumn = (options: Options): ModelAttributeColumnOptions => Object.assign(
    {
        type : DataTypes.UUIDV4,
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

    const findOne = (transaction: Transaction, id: string) : TaskEither<string, User | null> => tryCatch(
        async () => User.findOne({
            where: {
                id,
            },
            transaction,
        }),
        () => "Could not find a user",
    );

    const findAll = (transaction: Transaction, offset: number, limit: number): TaskEither<string, ReadonlyArray<User>> => tryCatch(
        async () => User.findAll({
            offset,
            limit,
            transaction
        }),
        () => "Could not find users",
    );

    const create = (transaction: Transaction, username: string) : TaskEither<string, User> => tryCatch(
        async () => User.create(
            { username },
            { transaction },
        ),
        () => "Could not create a user"
    );

    const update = (transaction: Transaction, id: string, username: string) : TaskEither<string, void> => tryCatch(
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
        () => "Could not create a user"
    );

    const destroy = (transaction: Transaction, id: string): TaskEither<string, number> => tryCatch(
        async () => User.destroy({
            where: {
                id,
            },
            transaction,
        }),
        () => "Could not destroy a user",
    );

    return {
        findOne,
        findAll,
        create,
        update,
        destroy,
    };
};

export type UserRepository = ReturnType<typeof userRepositoryBuilder>;
