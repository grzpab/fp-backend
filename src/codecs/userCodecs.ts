import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { buildRetCodec, NumberFromDate } from "./sharedCodecs";

// create / update / delete /
export const createUserCommandCodec = buildRetCodec({
    username: t.string,
    password: t.string,
});

export const updateUserCommandCodec = buildRetCodec({
    uuid: UUID,
    username: t.string,
    password: t.string,
});

export const userCodec = buildRetCodec({
    id: UUID,
    username: t.string,
    createdAt: NumberFromDate,
    updatedAt: NumberFromDate,
});

export const usersCodec = t.readonlyArray(userCodec);

export type CreateUserCommand = t.TypeOf<typeof createUserCommandCodec>;
export type UpdateUserCommand = t.TypeOf<typeof updateUserCommandCodec>;

export type User = t.TypeOf<typeof userCodec>;

