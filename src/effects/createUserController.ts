import { Transaction } from "sequelize";
import { buildController } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { emptyCodec, mapErrors } from "../codecs/sharedCodecs";
import { createUserCommandCodec, encodeUser, UserDto } from "../codecs/userCodecs";
import { pipe } from "fp-ts/lib/pipeable";
import { chainEitherK, TaskEither } from "fp-ts/lib/TaskEither";
import { buildError } from "./buildError";

const decodeInputs = curriedDecodeInputs({
    paramsCodec: emptyCodec,
    queryCodec: emptyCodec,
    bodyCodec: createUserCommandCodec,
    mapErrors,
});

export const createUserController = buildController({
    decodeInputs,
    buildError,
    callback: ({ decodedInputs, dataAccessLayer }) =>
        (transaction: Transaction): TaskEither<string, UserDto> => {
            const { username } = decodedInputs.body;

            return pipe(
                dataAccessLayer.userRepository.create(transaction, username),
                chainEitherK(user => encodeUser(user.toJSON())),
            );
        },
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
