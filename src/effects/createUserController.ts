import { Transaction } from "sequelize";
import { buildController, ControllerDependencies } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { emptyCodec, mapErrors } from "../codecs/sharedCodecs";
import { createUserCommandCodec, CreateUserCommand, encodeUser } from "../codecs/userCodecs";
import { pipe } from "fp-ts/lib/pipeable";
import { chainEitherK } from "fp-ts/lib/TaskEither";
import { buildError } from "../utilities/buildError";

const decodeInputs = curriedDecodeInputs({
    paramsCodec: emptyCodec,
    queryCodec: emptyCodec,
    bodyCodec: createUserCommandCodec,
    mapErrors,
});

const callback = ({ decodedInputs, dataAccessLayer }: ControllerDependencies<{}, {}, CreateUserCommand>) => (transaction: Transaction) => {
    const { username } = decodedInputs.body;

    return pipe(
        dataAccessLayer.userRepository.create(transaction, username),
        chainEitherK(encodeUser),
    );
};

export const createUserController = buildController({
    decodeInputs,
    buildError,
    callback,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
