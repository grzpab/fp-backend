import * as t from "io-ts";
import { buildControler, ControlerDependencies } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec, emptyCodec } from "src/codecs/sharedCodecs";
import { Transaction } from "sequelize/types";

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

    return dataAccessLayer.userRepository.findAll(transaction, offset, limit);
};

export const buildCreateUserControler = buildControler({
    decodeInputs,
    buildError,
    callback,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
