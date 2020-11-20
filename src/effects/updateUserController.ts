import * as t from "io-ts";
import { Transaction } from "sequelize";
import { pipe } from "fp-ts/lib/pipeable";
import { chain, chainEitherK } from "fp-ts/lib/TaskEither";
import { UUID } from "io-ts-types/UUID";
import { buildController } from "../sideEffects/buildController";
import { buildRetCodec } from "../codecs/sharedCodecs";
import { updateUserCommandCodec, encodeUser, UserDto } from "../codecs/userCodecs";
import type { TaskEither } from "fp-ts/TaskEither";
import type { ProgramError } from "../errors";

const paramsCodec = buildRetCodec({
    id: UUID,
});

export const updateUserController = buildController({
    paramsCodec,
    queryCodec: t.unknown,
    bodyCodec: updateUserCommandCodec,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    callback: ({ decodedInputs, dataAccessLayer }) =>
        (transaction: Transaction): TaskEither<ProgramError, UserDto> => {
            const { id } = decodedInputs.params;
            const { username } = decodedInputs.body;

            return pipe(
                dataAccessLayer.userRepository.update(transaction, id, username),
                chain(() => dataAccessLayer.userRepository.findOne(transaction, id)),
                chainEitherK(user => encodeUser(user.toJSON())),
            );

        },
});
