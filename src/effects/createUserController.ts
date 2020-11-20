import * as t from "io-ts";
import { Transaction } from "sequelize";
import { buildController } from "../sideEffects/buildController";
import { mapErrors } from "../codecs/sharedCodecs";
import { createUserCommandCodec, encodeUser, UserDto } from "../codecs/userCodecs";
import { pipe } from "fp-ts/lib/pipeable";
import { chainEitherK, TaskEither } from "fp-ts/lib/TaskEither";
import { buildError } from "./buildError";
import type { ProgramError } from "../errors";

export const createUserController = buildController({
    paramsCodec: t.unknown,
    queryCodec: t.unknown,
    bodyCodec: createUserCommandCodec,
    mapErrors,
    buildError,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    callback: ({ decodedInputs, dataAccessLayer }) =>
        (transaction: Transaction): TaskEither<ProgramError, UserDto> => {
            const { username } = decodedInputs.body;

            return pipe(
                dataAccessLayer.userRepository.create(transaction, username),
                chainEitherK(user => encodeUser(user.toJSON())),
            );
        },
});
