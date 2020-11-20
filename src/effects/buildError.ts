import { buildProgramError, ProgramError } from "../errors";

export const buildError = (reason: unknown): ProgramError => buildProgramError(`Unknown error occurred: ${String(reason)}`);
