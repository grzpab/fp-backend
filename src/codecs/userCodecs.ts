import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { buildRetCodec, buildRepCodec } from "./sharedCodecs";

// create / update / delete / 
export const createUserCommandCodec = buildRetCodec({
    uuid: UUID,
    username: t.string,
    password: t.string,
});

export const updateUserCommandCodec = buildRepCodec({
    username: t.string,
    password: t.string,
});

export type CreateUserCommand = t.TypeOf<typeof createUserCommandCodec>;
export type UpdateUserCommand = t.TypeOf<typeof updateUserCommandCodec>;
