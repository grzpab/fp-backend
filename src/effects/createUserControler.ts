import { Transaction } from "sequelize/types";
import { buildControler, ControlerDependencies } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec } from "../codecs/sharedCodecs";
import { createUserCommandCodec, CreateUserCommand, userCodec } from "../codecs/userCodecs";
import { pipe } from "fp-ts/lib/pipeable";
import { chainEitherK } from "fp-ts/lib/TaskEither";
import { mapLeft } from 'fp-ts/lib/Either'
import { failure } from 'io-ts/lib/PathReporter';

const emptyCodec = buildRetCodec({});

const decodeInputs = curriedDecodeInputs({
    paramsCodec: emptyCodec,
    queryCodec: emptyCodec,
    bodyCodec: createUserCommandCodec,
    mapErrors: () => "error",
});

const buildError = () => (e: unknown) => "error";

const callback = ({ decodedInputs, dataAccessLayer }: ControlerDependencies<{}, {}, CreateUserCommand>) => (transaction: Transaction) => {
    const { username } = decodedInputs.body;

    return pipe(
        dataAccessLayer.userRepository.create(transaction, username),
        chainEitherK((user) => 
            pipe(
                userCodec.decode(user),
                mapLeft((errors) => failure(errors).join(','))
            ),
        ),
    );

};

export const createUserControler = buildControler({
    decodeInputs,
    buildError,
    callback,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
