import type { TypeOf } from "io-ts";
import { Transaction } from "sequelize/types";
import { UUID } from "io-ts-types/UUID";
import { buildController, ControllerDependencies } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec, emptyCodec } from "../codecs/sharedCodecs";

const paramsCodec = buildRetCodec({
    id: UUID,
});

const decodeInputs = curriedDecodeInputs({
    paramsCodec,
    queryCodec: emptyCodec,
    bodyCodec: emptyCodec,
    mapErrors: () => "error",
});

const buildError = () => (e: unknown) => "error";

type Params = TypeOf<typeof paramsCodec>;

const callback = ({ decodedInputs, dataAccessLayer }: ControllerDependencies<Params, {}, {}>) => (transaction: Transaction) => {
    const { id } = decodedInputs.params;

    return dataAccessLayer.userRepository.destroy(transaction, id);
};

export const updateUserController = buildController({
    decodeInputs,
    buildError,
    callback,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
