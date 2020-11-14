import { createUserController } from "../../../src/effects/createUserController";
import { buildDataAccessLayer } from "../../../src/sideEffects/sequelize";
import { Sequelize } from "sequelize";
import { pipe } from "fp-ts/pipeable";
import { chain, fromTask } from "fp-ts/lib/TaskEither";
import { assertIs200, assertIsRight } from "../../../src/sideEffects/asserts";
import { assert } from "chai";

describe("createUserController", () => {
    it("creates a new user", async () => {
        const sequelize = new Sequelize("sqlite::memory:", {});

        const controller = pipe(
            buildDataAccessLayer(sequelize),
            chain(dataAccessLayer => fromTask(createUserController({
                inputs: {
                    params: {},
                    query: {},
                    body: {
                        "username": "test_username"
                    },
                },
                dataAccessLayer,
                getTime: () => Date.now(),
            })))
        );

        const either = await controller();
        assertIsRight(either);

        const result = either.right;
        assertIs200(result[0]);

        assert.strictEqual(result[1].username, "test_username");
    });
});


