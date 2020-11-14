import { createUserController } from "../../../src/effects/createUserController";
import { buildDataAccessLayer } from "../../../src/sideEffects/sequelize";
import { Sequelize } from "sequelize";
import { pipe } from "fp-ts/pipeable";
import { map } from "fp-ts/lib/TaskEither";
import { assert } from "chai";
import { assertIsRight } from "../../../src/sideEffects/assertIsRight";

describe("createUserController", () => {
    it("creates a new user", async () => {
        const sequelize = new Sequelize("sqlite::memory:", {});

        const controller = pipe(
            buildDataAccessLayer(sequelize),
            map(dataAccessLayer => createUserController({
                inputs: {
                    params: {},
                    query: {},
                    body: {
                        "username": "test_username"
                    },
                },
                dataAccessLayer,
                getTime: () => 1,
            }))
        );

        const either = await controller();

        assertIsRight(either);

        const [ httpStatusCode ] = await either.right();

        assert.strictEqual(httpStatusCode, 200);
    });
});


