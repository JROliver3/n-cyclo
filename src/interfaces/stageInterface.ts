import { Difficulty } from "../enums/game";

//TODO: store stage description in backend
export declare interface StageObject {
    // name of the stage
    name : string;
    // the description of the stage represents what the user is trying to recreate from memory. 
    description: string;
    // current difficulty level of the stage
    stageDifficulty: Difficulty;
    // number of times the stage has been shown
    stageCount: number;

} 