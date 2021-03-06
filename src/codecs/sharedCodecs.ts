import * as t from "io-ts";
import { failure } from "io-ts/PathReporter";
import type { ProgramError } from "../errors";

export const buildRetCodec = <T extends t.Props>(props: T): t.ReadonlyC<t.ExactC<t.TypeC<T>>> =>
    t.readonly(t.exact(t.type(props)));

export const mapErrors = (errors: t.Errors): ProgramError => ({
    type: "PROGRAM_ERROR",
    message: failure(errors).join(",")
});
