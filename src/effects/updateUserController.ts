import type { TypeOf } from "io-ts";
import { Transaction } from "sequelize/types";
import { pipe } from "fp-ts/lib/pipeable";
import { chain, chainEitherK } from "fp-ts/lib/TaskEither";
import { mapLeft } from "fp-ts/lib/Either";
import { failure } from "io-ts/lib/PathReporter";
import { UUID } from "io-ts-types/UUID";
import { buildController, ControllerDependencies } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec, emptyCodec } from "../codecs/sharedCodecs";
import { userCodec, updateUserCommandCodec, UpdateUserCommand } from "../codecs/userCodecs";

const paramsCodec = buildRetCodec({
    id: UUID,
});

const decodeInputs = curriedDecodeInputs({
    paramsCodec,
    queryCodec: emptyCodec,
    bodyCodec: updateUserCommandCodec,
    mapErrors: () => "error",
});

const buildError = () => (e: unknown) => "error";

type Params = TypeOf<typeof paramsCodec>;

const callback = ({ decodedInputs, dataAccessLayer }: ControllerDependencies<Params, {}, UpdateUserCommand>) => (transaction: Transaction) => {
    const { id } = decodedInputs.params;
    const { username } = decodedInputs.body;

    return pipe(
        dataAccessLayer.userRepository.update(transaction, id, username),
        chain(() => dataAccessLayer.userRepository.findOne(transaction, id)),
        chainEitherK((user) =>
            pipe(
                userCodec.decode(user),
                mapLeft((errors) => failure(errors).join(","))
            ),
        ),
    );

};

export const updateUserController = buildController({
    decodeInputs,
    buildError,
    callback,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
