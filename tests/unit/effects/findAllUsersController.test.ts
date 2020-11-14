import { buildDataAccessLayer } from "../../../src/sideEffects/sequelize";
import { Sequelize, Transaction } from "sequelize";
import { pipe } from "fp-ts/pipeable";
import { chain, fromTask } from "fp-ts/lib/TaskEither";
import { assertIs200, assertIsRight } from "../../../src/sideEffects/asserts";
import { buildTransaction } from "../../../src/sideEffects/buildTransaction";
import { buildError } from "../../../src/effects/buildError";
import { assert } from "chai";
import { findAllUsersController } from "../../../src/effects/findAllUsersController";

describe("findAllUsersController", () => {
    it("finds a user", async () => {
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
                chain(() => fromTask(findAllUsersController({
                    inputs: {
                        params: {},
                        query: {
                            offset: "0",
                            limit: "1"
                        },
                        body: {},
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

        assert.strictEqual(result[1].length, 1);
        assert.strictEqual(result[1][0].username, "test_username");
    });
});


