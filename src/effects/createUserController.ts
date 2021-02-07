import { v4 } from "uuid";
import * as t from "io-ts";
import { Transaction } from "sequelize";
import { buildController } from "../sideEffects/buildController";
import { createUserCommandCodec, encodeUser, UserDto } from "../codecs/userCodecs";
import { pipe } from "fp-ts/lib/pipeable";
import { chainEitherK, TaskEither } from "fp-ts/lib/TaskEither";
import type { ProgramError } from "../errors";

export const createUserController = buildController({
    paramsCodec: t.unknown,
    queryCodec: t.unknown,
    bodyCodec: createUserCommandCodec,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    callback: ({ decodedInputs, dataAccessLayer }) =>
        (transaction: Transaction): TaskEither<ProgramError, UserDto> => {
            const id = v4();
            const { username } = decodedInputs.body;

            return pipe(
                dataAccessLayer.userRepository.create(transaction, id, username),
                chainEitherK(encodeUser),
            );
        },
});
