import * as t from "io-ts";
import { buildController } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
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

const decodeInputs = curriedDecodeInputs({
    paramsCodec: emptyCodec,
    queryCodec,
    bodyCodec: emptyCodec,
    mapErrors,
});

export const findAllUsersController = buildController({
    decodeInputs,
    buildError,
    callback: ({ decodedInputs, dataAccessLayer }) =>
        (transaction: Transaction): TaskEither<string, ReadonlyArray<UserDto>> => {
            const { offset, limit } = decodedInputs.query;

            return pipe(
                dataAccessLayer.userRepository.findAll(transaction, offset, limit),
                chainEitherK((users) => encodeUsers(users.map(user => user.toJSON()))),
            );
        },
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
