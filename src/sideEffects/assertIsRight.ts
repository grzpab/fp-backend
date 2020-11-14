import { Either, Right, isRight } from "fp-ts/Either";

export function assertIsRight<E, A>(either: Either<E, A>): asserts either is Right<A> {
    if (!isRight(either)) {
        throw new Error("Either<E, A> is not Right<A>");
    }
}
