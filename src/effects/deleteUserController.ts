import * as t from "io-ts";
import { Transaction } from "sequelize";
import { UUID } from "io-ts-types/UUID";
import { buildController } from "../sideEffects/buildController";
import { buildRetCodec, mapErrors } from "../codecs/sharedCodecs";
import { TaskEither } from "fp-ts/TaskEither";
import { ProgramError } from "../errors";

const paramsCodec = buildRetCodec({
    id: UUID,
});

export const deleteUserController = buildController({
    paramsCodec,
    queryCodec: t.unknown,
    bodyCodec: t.unknown,
    mapErrors,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    callback: ({ decodedInputs, dataAccessLayer }) =>
        (transaction: Transaction): TaskEither<ProgramError, void> => {
            const { id } = decodedInputs.params;

            return dataAccessLayer.userRepository.destroy(transaction, id);
        },
});
