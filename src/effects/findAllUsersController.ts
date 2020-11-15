import * as t from "io-ts";
import { buildController } from "../sideEffects/buildController";
import { buildRetCodec, mapErrors } from "../codecs/sharedCodecs";
import { Transaction } from "sequelize";
import { pipe } from "fp-ts/lib/pipeable";
import { chainEitherK } from "fp-ts/lib/TaskEither";
import { encodeUsers, UserDto } from "../codecs/userCodecs";
import { buildError } from "./buildError";
import { TaskEither } from "fp-ts/TaskEither";
import { NumberFromString } from "io-ts-types";

const queryCodec = buildRetCodec({
    offset: NumberFromString,
    limit: NumberFromString,
});

export const findAllUsersController = buildController({
    paramsCodec: t.unknown,
    queryCodec,
    bodyCodec: t.unknown,
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
