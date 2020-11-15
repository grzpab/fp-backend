import { buildDataAccessLayer } from "../../../src/sideEffects/sequelize";
import { Sequelize } from "sequelize";
import { pipe } from "fp-ts/pipeable";
import { chain, fromTask } from "fp-ts/lib/TaskEither";
import { healthCheckController } from "../../../src/effects/healthCheckController";
import { assert as tsAssert } from "ts-essentials/dist/functions";
import { isRight } from "fp-ts/Either";

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
        tsAssert(isRight(either));

        const result = either.right;

        tsAssert(result[0] === 200);
    });
});


