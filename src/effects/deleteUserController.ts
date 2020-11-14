import type { TypeOf } from "io-ts";
import { Transaction } from "sequelize";
import { UUID } from "io-ts-types/UUID";
import { buildController, ControllerDependencies } from "../sideEffects/buildController";
import { curriedDecodeInputs } from "./buildInputDecoder";
import { buildRetCodec, emptyCodec, mapErrors } from "../codecs/sharedCodecs";
import { buildError } from "./buildError";

const paramsCodec = buildRetCodec({
    id: UUID,
});

const decodeInputs = curriedDecodeInputs({
    paramsCodec,
    queryCodec: emptyCodec,
    bodyCodec: emptyCodec,
    mapErrors,
});

type Params = TypeOf<typeof paramsCodec>;

const callback = ({ decodedInputs, dataAccessLayer }: ControllerDependencies<Params, {}, {}>) => (transaction: Transaction) => {
    const { id } = decodedInputs.params;

    return dataAccessLayer.userRepository.destroy(transaction, id);
};

export const deleteUserController = buildController({
    decodeInputs,
    buildError,
    callback,
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
});
