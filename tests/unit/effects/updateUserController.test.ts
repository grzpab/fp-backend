import { v4 } from "uuid";
import { buildDataAccessLayer } from "../../../src/sideEffects/sequelize";
import { Sequelize, Transaction } from "sequelize";
import { pipe } from "fp-ts/pipeable";
import { chain, fromTask } from "fp-ts/lib/TaskEither";
import { buildTransaction } from "../../../src/sideEffects/buildTransaction";
import { buildError } from "../../../src/effects/buildError";
import { updateUserController } from "../../../src/effects/updateUserController";
import { assert } from "chai";
import { assert as tsAssert } from "ts-essentials";
import { isRight } from "fp-ts/Either";

describe("updateUserController", () => {
    it("updates a user", async () => {
        const id = v4();
        const sequelize = new Sequelize("sqlite::memory:", {});

        const program = pipe(
            buildDataAccessLayer(sequelize),
            chain(dataAccessLayer => pipe(
                buildTransaction(
                    buildError,
                    (t) => dataAccessLayer.userRepository.create(t, id,"test_username"),
                    Transaction.ISOLATION_LEVELS.READ_COMMITTED,
                    dataAccessLayer.sequelize,
                ),
                chain(() => fromTask(updateUserController({
                    inputs: {
                        params: {
                            id,
                        },
                        query: {},
                        body: {
                            username: "test_username_2"
                        },
                    },
                    dataAccessLayer,
                    getTime: () => Date.now(),
                })))),
            ),
        );

        const either = await program();
        tsAssert(isRight(either));

        const result = either.right;

        tsAssert(result[0] === 200);
        assert.strictEqual(result[1].username, "test_username_2");
    });
});


