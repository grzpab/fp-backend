import { Transaction } from "sequelize";
import { pipe } from "fp-ts/lib/pipeable";
import { chain, chainEitherK } from "fp-ts/lib/TaskEither";
import { UUID } from "io-ts-types/UUID";
import { buildController } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec, emptyCodec, mapErrors } from "../codecs/sharedCodecs";
import { updateUserCommandCodec, encodeUser, UserDto } from "../codecs/userCodecs";
import { buildError } from "./buildError";
import { TaskEither } from "fp-ts/TaskEither";

const paramsCodec = buildRetCodec({
    id: UUID,
});

const decodeInputs = curriedDecodeInputs({
    paramsCodec,
    queryCodec: emptyCodec,
    bodyCodec: updateUserCommandCodec,
    mapErrors,
});

export const updateUserController = buildController({
    decodeInputs,
    buildError,
    callback: ({ decodedInputs, dataAccessLayer }) =>
        (transaction: Transaction): TaskEither<string, UserDto> => {
            const { id } = decodedInputs.params;
            const { username } = decodedInputs.body;

            return pipe(
                dataAccessLayer.userRepository.update(transaction, id, username),
                chain(() => dataAccessLayer.userRepository.findOne(transaction, id)),
                chainEitherK(encodeUser),
            );

        },
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
