import { pipe } from "fp-ts/lib/pipeable";
import { fold, Either } from "fp-ts/lib/Either";
import { buildProgram } from "./sideEffects/buildProgram";

const program = buildProgram(process.env, "fp-backend");

const programFinishedCallback = <A, B>(either: Either<A, B>) => pipe(
    either,
    fold(
        (error) => { console.log(`Connection unsuccessful: ${String(error)}`); },
        () => { console.log("Connection successful"); }
    )
);

// eslint-disable-next-line @typescript-eslint/no-floating-promises
program().then(programFinishedCallback);
