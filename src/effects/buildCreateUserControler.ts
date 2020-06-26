import { buildControler, ControlerDependencies } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec } from "src/codecs/sharedCodecs";
import { Transaction } from "sequelize/types";
import { createUserCommandCodec, CreateUserCommand } from "src/codecs/userCodecs";

const emptyCodec = buildRetCodec({});

const decodeInputs = curriedDecodeInputs({
    paramsCodec: emptyCodec,
    queryCodec: emptyCodec,
    bodyCodec: createUserCommandCodec,
    mapErrors: () => "error",
});

const buildError = () => (e: unknown) => "error";

const callback = ({ decodedInputs, dataAccessLayer }: ControlerDependencies<{}, {}, CreateUserCommand>) => (transaction: Transaction) => {
    const { username, password } = decodedInputs.body;

    return dataAccessLayer.createUser(transaction, username, password);
};

export const buildCreateUserControler = buildControler({
    decodeInputs,
    buildError,
    callback,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
