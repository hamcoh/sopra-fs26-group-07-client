export interface Room {
    roomId: number;
    roomJoinCode: string;
    maxNumPlayers: number;
    currentNumPlayers: number;
    isRoomOpen: boolean;
    hostUserId: number;
    playerIds: number[];
    gameDifficulty: string;
    gameLanguage: string;
    gameMode: string;
    maxSkips: number | null;
    timeLimitSeconds: number | null;
    numOfProblems: number | null;
}
