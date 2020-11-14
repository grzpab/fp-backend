import { Transaction } from "sequelize";
import { UUID } from "io-ts-types/UUID";
import { buildController } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec, emptyCodec, mapErrors } from "../codecs/sharedCodecs";
import { buildError } from "./buildError";
import { TaskEither } from "fp-ts/TaskEither";

const paramsCodec = buildRetCodec({
    id: UUID,
});

const decodeInputs = curriedDecodeInputs({
    paramsCodec,
    queryCodec: emptyCodec,
    bodyCodec: emptyCodec,
    mapErrors,
});

export const deleteUserController = buildController({
    decodeInputs,
    buildError,
    callback: ({ decodedInputs, dataAccessLayer }) =>
        (transaction: Transaction): TaskEither<string, void> => {
            const { id } = decodedInputs.params;

            return dataAccessLayer.userRepository.destroy(transaction, id);
        },
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
