import type { TypeOf } from "io-ts";
import { Transaction } from "sequelize";
import { pipe } from "fp-ts/lib/pipeable";
import { chain, chainEitherK } from "fp-ts/lib/TaskEither";
import { UUID } from "io-ts-types/UUID";
import { buildController, ControllerDependencies } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec, emptyCodec, mapErrors } from "../codecs/sharedCodecs";
import { updateUserCommandCodec, UpdateUserCommand, encodeUser, UserDto } from "../codecs/userCodecs";
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

type Params = TypeOf<typeof paramsCodec>;

const callback = ({ decodedInputs, dataAccessLayer }: ControllerDependencies<Params, {}, UpdateUserCommand>) =>
    (transaction: Transaction): TaskEither<string, UserDto> => {
        const { id } = decodedInputs.params;
        const { username } = decodedInputs.body;

        return pipe(
            dataAccessLayer.userRepository.update(transaction, id, username),
            chain(() => dataAccessLayer.userRepository.findOne(transaction, id)),
            chainEitherK(encodeUser),
        );

    };

export const updateUserController = buildController({
    decodeInputs,
    buildError,
    callback,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
