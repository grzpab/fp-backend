import * as t from "io-ts";
import { buildController } from "../sideEffects/buildController";
import { buildRetCodec } from "../codecs/sharedCodecs";
import { Transaction } from "sequelize";
import { pipe } from "fp-ts/lib/pipeable";
import { chainEitherK } from "fp-ts/lib/TaskEither";
import { encodeUsers, UserDto } from "../codecs/userCodecs";
import type { TaskEither } from "fp-ts/TaskEither";
import { NumberFromString } from "io-ts-types";
import type { ProgramError } from "../errors";

const queryCodec = buildRetCodec({
    offset: NumberFromString,
    limit: NumberFromString,
});

export const findAllUsersController = buildController({
    paramsCodec: t.unknown,
    queryCodec,
    bodyCodec: t.unknown,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    callback: ({ decodedInputs, dataAccessLayer }) =>
        (transaction: Transaction): TaskEither<ProgramError, ReadonlyArray<UserDto>> => {
            const { offset, limit } = decodedInputs.query;

            return pipe(
                dataAccessLayer.userRepository.findAll(transaction, offset, limit),
                chainEitherK(encodeUsers),
            );
        },
});
