import { v4 } from "uuid";
import { buildDataAccessLayer, DataAccessLayer } from "../../../src/sideEffects/sequelize";
import { Sequelize, Transaction } from "sequelize";
import { pipe } from "fp-ts/pipeable";
import { chain, fromTask } from "fp-ts/lib/TaskEither";
import { buildTransaction } from "../../../src/sideEffects/buildTransaction";
import { buildError } from "../../../src/effects/buildError";
import { updateUserController } from "../../../src/effects/updateUserController";
import { assert } from "chai";
import { assert as tsAssert } from "ts-essentials";
import { isRight } from "fp-ts/Either";
import { buildLoggers } from "../../../src/sideEffects/buildLoggers";
import { log } from "fp-ts/Console";
import { ControllerInput } from "../../../src/sideEffects/buildController";

describe("updateUserController", () => {
    it("updates a user", async () => {
        const id = v4();
        const sequelize = new Sequelize("sqlite::memory:", {});
        const loggers = buildLoggers(log);

        const buildControllerInput = (dataAccessLayer: DataAccessLayer): ControllerInput => ({
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
            loggers,
        });

        const program = pipe(
            buildDataAccessLayer(sequelize),
            chain(dataAccessLayer => pipe(
                buildTransaction(
                    buildError,
                    (t) => dataAccessLayer.userRepository.create(t, id,"test_username"),
                    Transaction.ISOLATION_LEVELS.READ_COMMITTED,
                    dataAccessLayer.sequelize,
                )(loggers),
                chain(() => fromTask(updateUserController(buildControllerInput(dataAccessLayer))))),
            ),
        );

        const either = await program();
        tsAssert(isRight(either));

        const result = either.right;

        tsAssert(result[0] === 200);
        assert.strictEqual(result[1].username, "test_username_2");
    });
});


