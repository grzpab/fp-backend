import { buildDataAccessLayer } from "../../../src/sideEffects/sequelize";
import { Sequelize, Transaction } from "sequelize";
import { pipe } from "fp-ts/pipeable";
import { chain, fromTask } from "fp-ts/lib/TaskEither";
import { assertIs200, assertIsRight } from "../../../src/sideEffects/asserts";
import { buildTransaction } from "../../../src/sideEffects/buildTransaction";
import { buildError } from "../../../src/effects/buildError";
import { updateUserController } from "../../../src/effects/updateUserController";
import { assert } from "chai";

describe("updateUserController", () => {
    it("updates a user", async () => {
        const sequelize = new Sequelize("sqlite::memory:", {});

        const program = pipe(
            buildDataAccessLayer(sequelize),
            chain(dataAccessLayer => pipe(
                buildTransaction(
                    buildError,
                    (t) => dataAccessLayer.userRepository.create(t, "test_username"),
                    Transaction.ISOLATION_LEVELS.READ_COMMITTED,
                    dataAccessLayer.sequelize,
                ),
                chain(({ id }) => fromTask(updateUserController({
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

        assertIsRight(either);

        const result = either.right;
        assertIs200(result[0]);

        assert.strictEqual(result[1].username, "test_username_2");
    });
});

