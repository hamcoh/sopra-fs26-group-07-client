export type GameLanguage = "JAVA" | "PYTHON" | "SQLITE" | string;

export interface GameStatsDTO {
    problemId: number;
    title: string;
    description: string;
    gameLanguage: GameLanguage;
    sumPassedTestCases: number;
    sumTotalTestCases: number;
    totalSubmissionCount: number;
    totalSuccessRate: number;
    playerSumPassedTestCases: number | null;
    playerSumTotalTestCases: number | null;
    playerSuccessRate: number | null;
}