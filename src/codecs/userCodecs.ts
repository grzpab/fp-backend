import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { buildRetCodec, mapErrors } from "./sharedCodecs";
import { pipe } from "fp-ts/pipeable";
import { Either, map, mapLeft } from "fp-ts/Either";
import { date } from "io-ts-types";

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
    createdAt: date,
    updatedAt: date,
});

export const usersCodec = t.readonlyArray(userCodec);

export type CreateUserCommand = t.TypeOf<typeof createUserCommandCodec>;
export type UpdateUserCommand = t.TypeOf<typeof updateUserCommandCodec>;

export const encodeUser = (user: unknown): Either<string, unknown> => pipe(
    userCodec.decode(user),
    mapLeft(mapErrors),
    map(({ id, username, createdAt, updatedAt }) => ({
        id,
        username,
        createdAt: createdAt.getTime(),
        updatedAt: updatedAt.getTime(),
    })),
);

export const encodeUsers = (users: unknown): Either<string, unknown> => pipe(
    usersCodec.decode(users),
    mapLeft(mapErrors),
    map((_users) => _users.map(user => ({
        id: user.id,
        username: user.username,
        createdAt: user.createdAt.getTime(),
        updatedAt: user.updatedAt.getTime(),
    }))),
);
