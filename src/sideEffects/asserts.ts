import { Either, Right, isRight } from "fp-ts/Either";

export function assertIsRight<E, A>(either: Either<E, A>): asserts either is Right<A> {
    if (!isRight(either)) {
        throw new Error("Either<E, A> is not Right<A>");
    }
}

export function assertIs200(value: number): asserts value is 200 {
    if (value !== 200) {
        throw new Error(`value ${value} was not 200`);
    }
}
