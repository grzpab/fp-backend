import * as t from "io-ts";
import { buildController } from "../sideEffects/buildController";
import { buildRetCodec, emptyCodec, mapErrors } from "../codecs/sharedCodecs";
import { Transaction } from "sequelize";
import { pipe } from "fp-ts/lib/pipeable";
import { chainEitherK } from "fp-ts/lib/TaskEither";
import { encodeUsers, UserDto } from "../codecs/userCodecs";
import { buildError } from "./buildError";
import { TaskEither } from "fp-ts/TaskEither";

const queryCodec = buildRetCodec({
    offset: t.Int,
    limit: t.Int,
});

export const findAllUsersController = buildController({
    paramsCodec: emptyCodec,
    queryCodec,
    bodyCodec: emptyCodec,
    mapErrors,
    buildError,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    callback: ({ decodedInputs, dataAccessLayer }) =>
        (transaction: Transaction): TaskEither<string, ReadonlyArray<UserDto>> => {
            const { offset, limit } = decodedInputs.query;

            return pipe(
                dataAccessLayer.userRepository.findAll(transaction, offset, limit),
                chainEitherK((users) => encodeUsers(users.map(user => user.toJSON()))),
            );
        },
});
