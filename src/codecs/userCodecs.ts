import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { buildRetCodec, mapErrors } from "./sharedCodecs";
import { pipe } from "fp-ts/pipeable";
import { Either, map, mapLeft } from "fp-ts/Either";
import { date } from "io-ts-types";
import { ProgramError } from "../errors";

export const createUserCommandCodec = buildRetCodec({
    username: t.string,
});

export const updateUserCommandCodec = buildRetCodec({
    username: t.string,
});

export const userCodec = buildRetCodec({
    id: UUID,
    username: t.string,
    createdAt: date,
    updatedAt: date,
});

export type CreateUserCommand = t.TypeOf<typeof createUserCommandCodec>;
export type UpdateUserCommand = t.TypeOf<typeof updateUserCommandCodec>;
export type User = t.TypeOf<typeof userCodec>;

export type UserDto = Readonly<{
    id: string,
    username: string,
    createdAt: number,
    updatedAt: number,
}>;

export const mapDecodedUserToUserDto = ({ id, username, createdAt, updatedAt }: User): UserDto => ({
    id,
    username,
    createdAt: createdAt.getTime(),
    updatedAt: updatedAt.getTime(),
});

export const encodeUser = (user: unknown): Either<ProgramError, UserDto> => pipe(
    userCodec.decode(user),
    mapLeft(mapErrors),
    map(mapDecodedUserToUserDto),
);

export const encodeUsers = (users: unknown): Either<ProgramError, ReadonlyArray<UserDto>> => pipe(
    t.readonlyArray(userCodec).decode(users),
    mapLeft(mapErrors),
    map((_users) => _users.map(mapDecodedUserToUserDto)),
);
