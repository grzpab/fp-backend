import { buildDataAccessLayer } from "../../../src/sideEffects/sequelize";
import { Sequelize } from "sequelize";
import { pipe } from "fp-ts/pipeable";
import { chain, fromTask } from "fp-ts/lib/TaskEither";
import { assertIs200, assertIsRight } from "../../../src/sideEffects/asserts";
import { healthCheckController } from "../../../src/effects/healthCheckController";

describe("healthCheckController", () => {
    it("responds to the call", async () => {
        const sequelize = new Sequelize("sqlite::memory:", {});

        const controller = pipe(
            buildDataAccessLayer(sequelize),
            chain(dataAccessLayer => fromTask(healthCheckController({
                inputs: {
                    params: {},
                    query: {},
                    body: {},
                },
                dataAccessLayer,
                getTime: () => Date.now(),
            })))
        );

        const either = await controller();
        assertIsRight(either);

        const result = either.right;
        assertIs200(result[0]);
    });
});


