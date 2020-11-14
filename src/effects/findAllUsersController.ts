import * as t from "io-ts";
import { buildController, ControllerDependencies } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec, emptyCodec, mapErrors } from "../codecs/sharedCodecs";
import { Transaction } from "sequelize";
import { pipe } from "fp-ts/lib/pipeable";
import { chainEitherK } from "fp-ts/lib/TaskEither";
import { encodeUsers } from "../codecs/userCodecs";
import { buildError } from "./buildError";

const queryCodec = buildRetCodec({
    offset: t.Int,
    limit: t.Int,
});

type Query = t.TypeOf<typeof queryCodec>;

const decodeInputs = curriedDecodeInputs({
    paramsCodec: emptyCodec,
    queryCodec,
    bodyCodec: emptyCodec,
    mapErrors,
});

const callback = ({ decodedInputs, dataAccessLayer }: ControllerDependencies<{}, Query, {}>) => (transaction: Transaction) => {
    const { offset, limit } = decodedInputs.query;

    return pipe(
        dataAccessLayer.userRepository.findAll(transaction, offset, limit),
        chainEitherK((users) => encodeUsers(users.map(user => user.toJSON()))),
    );
};

export const findAllUsersController = buildController({
    decodeInputs,
    buildError,
    callback,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
