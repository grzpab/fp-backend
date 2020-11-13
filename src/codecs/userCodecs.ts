import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { buildRetCodec, mapErrors, NumberFromDate } from "./sharedCodecs";
import { pipe } from "fp-ts/pipeable";
import { Either, mapLeft } from "fp-ts/Either";

export const createUserCommandCodec = buildRetCodec({
    username: t.string,
});

export const updateUserCommandCodec = buildRetCodec({
    uuid: UUID,
    username: t.string,
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
export type Users = t.TypeOf<typeof usersCodec>;

export const encodeUser = (user: unknown): Either<string, User> => pipe(
    userCodec.decode(user),
    mapLeft(mapErrors),
);

export const encodeUsers = (users: unknown): Either<string, Users> => pipe(
    usersCodec.decode(users),
    mapLeft(mapErrors),
);
