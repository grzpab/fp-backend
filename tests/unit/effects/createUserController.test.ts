import { createUserController } from "../../../src/effects/createUserController";
import { buildDataAccessLayer } from "../../../src/sideEffects/sequelize";
import { Sequelize } from "sequelize";
import { pipe } from "fp-ts/pipeable";
import { chain, fromTask } from "fp-ts/lib/TaskEither";
import { assert } from "chai";
import { assert as tsAssert } from "ts-essentials/dist/functions";
import { isRight } from "fp-ts/Either";

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
        tsAssert(isRight(either));

        const result = either.right;

        tsAssert(result[0] === 200);
        assert.strictEqual(result[1].username, "test_username");
    });
});


