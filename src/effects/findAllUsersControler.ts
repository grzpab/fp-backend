import * as t from "io-ts";
import { buildControler, ControlerDependencies } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec, emptyCodec } from "src/codecs/sharedCodecs";
import { Transaction } from "sequelize/types";
import { pipe } from "fp-ts/lib/pipeable";
import { chainEitherK } from "fp-ts/lib/TaskEither";
import { usersCodec } from "src/codecs/userCodecs";
import { mapLeft } from "fp-ts/lib/Either";
import { failure } from "io-ts/lib/PathReporter";

const queryCodec = buildRetCodec({
    offset: t.Int,
    limit: t.Int,
});

type Query = t.TypeOf<typeof queryCodec>;

const decodeInputs = curriedDecodeInputs({
    paramsCodec: emptyCodec,
    queryCodec,
    bodyCodec: emptyCodec,
    mapErrors: () => "error",
});

const buildError = () => (e: unknown) => "error";

const callback = ({ decodedInputs, dataAccessLayer }: ControlerDependencies<{}, Query, {}>) => (transaction: Transaction) => {
    const { offset, limit } = decodedInputs.query;

    return pipe(
        dataAccessLayer.userRepository.findAll(transaction, offset, limit),
        chainEitherK((users) => 
            pipe(
                usersCodec.decode(users),
                mapLeft((errors) => failure(errors).join(','))
            ),
        ),
    );
};

export const findAllUsersControler = buildControler({
    decodeInputs,
    buildError,
    callback,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
