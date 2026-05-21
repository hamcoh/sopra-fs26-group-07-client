export interface GameRoundData {
    gameSessionId: number;
    playerSessionId: number;
    playerId: number;
    currentScore: number;
    numOfSkippedProblems: number;
    problemId: number;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    gameLanguage: string;
    gameMode?: string;  
    opponentName?: string;
    playerAvatarId?: number;
    opponentAvatarId?: number;
    endsAt?: string;
    serverTime?: string;
    maxSkips?: number;
    hint?: string;
}
  
  export interface RunTestCase {
    testCaseId: number;
    expectedOutput: string;
    actualOutput: string;
    result: "PASS" | "FAIL" | "ERROR";
    errorMessage: string | null;
  }
  
  export interface ExecutionResult {
    message?: string;
    status: "success" | "error" | "info";
    testCases?: RunTestCase[];
    summary?: string;
  }
  
  export interface GameSessionSampleSolutionsDTO {
    problemId: number;
    problemTitle: string;
    problemSampleSolution: string;
  }
  
  export interface PlayerScoreDTO {
    playerSessionId: number;
    userId: number;
    username: string;
    score: number;
    problemsSolved: number;
    totalGamesPlayed: number;
    winCount: number;
    drawCount: number;
    winRatePercentage: number;
  }
  
  export interface GameEndDTO {
    gameSessionId: number;
    gameStatus: string;
    gameEndReason: string;
    winnerPlayerId: number;
    playerScores: PlayerScoreDTO[];
    gameSessionSampleSolutions: GameSessionSampleSolutionsDTO[];
  }
  
  export interface PlayerGameSummaryDTO {
    playerSessionId: number;
    playerId: number;
    problemResults: {
      solvedCorrectly: number[];
      solvedPartiallyCorrectly: number[];
      solvedWrong: number[];
    };
  }
  
  export interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    duration: number;
  }
  
  export interface Problem {
    id: number;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    hint?: string;
    difficulty?: string;
  }