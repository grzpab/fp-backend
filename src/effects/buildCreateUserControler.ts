import { Transaction } from "sequelize/types";
import { buildControler, ControlerDependencies } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec } from "../codecs/sharedCodecs";
import { createUserCommandCodec, CreateUserCommand } from "../codecs/userCodecs";

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

    return dataAccessLayer.userRepository.create(transaction, username);
};

export const buildCreateUserControler = buildControler({
    decodeInputs,
    buildError,
    callback,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
