export type ProgramError =
    | Readonly<{
        type: "NOT_FOUND",
        message: string,
    }>
    | Readonly<{
        type: "PROGRAM_ERROR",
        message: string,
    }>;

export const buildNotFoundError = (message: string): ProgramError => ({
    type: "NOT_FOUND",
    message,
});

export const buildProgramError = (message: string): ProgramError => ({
    type: "PROGRAM_ERROR",
    message,
});
