import { v4 } from "uuid";
import { buildDataAccessLayer } from "../../../src/sideEffects/sequelize";
import { Sequelize, Transaction } from "sequelize";
import { pipe } from "fp-ts/pipeable";
import { chain, fromTask } from "fp-ts/lib/TaskEither";
import { buildTransaction } from "../../../src/sideEffects/buildTransaction";
import { buildError } from "../../../src/effects/buildError";
import { deleteUserController } from "../../../src/effects/deleteUserController";
import { assert as tsAssert } from "ts-essentials/dist/functions";
import { isRight } from "fp-ts/Either";
import { buildLoggers } from "../../../src/sideEffects/buildLoggers";
import { log } from "fp-ts/Console";

describe("deleteUserController", () => {
    it("deletes a user", async () => {
        const id = v4();
        const sequelize = new Sequelize("sqlite::memory:", {});
        const loggers = buildLoggers(log);

        const program = pipe(
            buildDataAccessLayer(sequelize),
            chain(dataAccessLayer => {
                const transaction = buildTransaction(
                    buildError,
                    (t) => dataAccessLayer.userRepository.create(t, id,"test_username"),
                    Transaction.ISOLATION_LEVELS.READ_COMMITTED,
                    dataAccessLayer.sequelize,
                )(loggers);

                return pipe(
                    transaction,
                    chain(() => fromTask(deleteUserController({
                        inputs: {
                            params: {
                                id,
                            },
                            query: {},
                            body: {},
                        },
                        dataAccessLayer,
                        getTime: () => Date.now(),
                        loggers,
                    }))),
                );
            }),
        );

        const either = await program();
        tsAssert(isRight(either));

        const result = either.right;

        tsAssert(result[0] === 200);
    });
});


