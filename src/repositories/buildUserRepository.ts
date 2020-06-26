import { v4 } from "uuid";
import { Sequelize, Model, ModelAttributes, ModelAttributeColumnOptions, DataTypes, Transaction } from "sequelize";
import { tryCatch } from "fp-ts/lib/TaskEither";

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

    const create = (transaction: Transaction, username: string) : TaskEither<string, User> => tryCatch(
        () => User.create(
            { username },
            { transaction },
        ),
        () => "Could not create a user"
    );

    return {
        create,
    };
};

export type UserRepository = ReturnType<typeof userRepositoryBuilder>;
