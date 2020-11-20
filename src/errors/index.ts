export type ProgramError =
    Readonly<{
        type: "PROGRAM_ERROR",
        message: string,
    }>;

export const buildProgramError = (message: string): ProgramError => ({
    type: "PROGRAM_ERROR",
    message,
});
