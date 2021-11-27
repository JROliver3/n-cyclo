import { LitElement, property } from 'lit-element';
import { Difficulty } from '../enums/game';
/** 
 * Stage instances are occurrences of a stage (a collection of words with user attributes such as score, difficulty, etc.) 
 * that are independent of the stage types. 
 *
 * The Track class uses stages to challenge the user with a series of questions meant to strengthen their core
 * abilities and enable parent components to track their results over time. The results returned apply to the single
 * instance of the track, but results may be stored elsewhere for further computation. The track class is meant to be 
 * an underlying framework for every game featured on Ncyclo and is not meant to represent a game itself. 
 * 
 * Each game should be designed to work based off of the current capabilities of Track, and any future capabilities 
 * should be added to the track class itself. If there are independent capabilities for a single game then they should 
 * not be added to the track class but to the game class itself. 
 * 
 * The Game progression works based on the starting difficulty level of STARTER then moves to EASY and beyond.
 * The track difficulty level is what represents the overall difficulty level of the player session. During auto
 * progression plays, the track difficulty will naturally increase as the player's performance improves (TODO). 
 * The normal setting will allow stages to move to the track difficulty level and then choose another stage 
 * as opposed to moving forward.
*/


export declare interface TrackStatus {
    // name of the track being run
    name: string;
    // number of stages answered correctly
    answerRight: number;
    // number of stages answered incorrectly
    answerWrong: number;
}

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
    // how many correct answers for the stage
    answerRight: number;
    // how many wrong answers for the stage
    answerWrong: number;
} 

export class Track extends LitElement {
    @property({ type: Object }) trackStatus: TrackStatus = {answerRight: 0, answerWrong: 0} as TrackStatus;
    @property({type: Array }) allStages: string[] = [];
    @property({ type: Array }) stages: StageObject[] = [];
    @property({ type: Array }) stageBuffer: string[] = [];
    @property({ type: Number }) trackDifficulty: Difficulty = 0;
    @property({ type: Number }) instanceCount = 0;
    @property({ type: Number }) round = 0;
    @property({ type: Boolean }) auto = false;
    @property({ type: Boolean }) rebuffer = false;
    @property({ type: String }) bookId = "";
    @property({ type: String }) trackMessage = "";

    private stageGeneratorInstance: Generator<string, void, unknown> = {} as Generator<string, void, unknown>;

    protected get stageInstance() {
        if (this.stageBuffer.length == 0 || this.round == 0 || this.rebuffer) {
            this.rebuffer = false;
            this.stageBuffer = [] as string[];
            let instanceDistribution = this.getStageDistribution(10);
            for (const stage of instanceDistribution) {
                for (var i = 0; i < stage.count; i++) {
                    this.stageBuffer.push(stage.name);
                    this.stageBuffer = this.shuffle(this.stageBuffer);
                }
            }
        }
        let instance = this.stageBuffer.pop();
        let stageInstance = this.stages.find((value) => value.name === instance);
        if (stageInstance) { stageInstance.stageCount++; }
        this.round++;
        return stageInstance?.name;
    }
    // Provide full list of possible stages and let the track decide which to show based on the chosen track difficulty. A small subset of the 
    // stages provided will actually be selected or used. Once all of the stages are used the track will end. The track is not meant to be completed
    // for all of the stages provided, rather the user will make as much progress as possible with a timer and log their results. If the track ends then
    // another book must be selected before proceeding. 
    protected loadStages(bookId: string, allStages: string[], difficulty = Difficulty.EASY) {
        this.trackDifficulty = difficulty;
        this.allStages = allStages;
        this.bookId = bookId;
        this.stages = this.getRandomStages();
    }

    private replaceCompleteStage(stage:StageObject){
        this.stages = this.stages.filter(el => el.name != stage?.name);
        let nextStage = this.stageGeneratorInstance.next().value;
        if(!nextStage){
            this.trackMessage = "Book Complete!!! Press Enter To Restart On Hard.";
            this.loadStages(this.bookId, this.allStages, Difficulty.HARD);
            return;
        }
        this.stages.push(this.getNewStageByDescription(nextStage));
        this.rebuffer = true;
        
    }

    private getDifficultyOptions(attr: string){
        let options = new Map<string, number>([["stageLimit", 0], ["maxStageSize", 0]]);
        switch (this.trackDifficulty) {
            case (Difficulty.EASY):
                options.set("stageLimit", 3);
                options.set("maxStageSize", 9);
                break;
            case (Difficulty.MEDIUM):
                options.set("stageLimit", 5);
                options.set("maxStageSize", 15);
                break;
            case (Difficulty.HARD):
                options.set("stageLimit", 7);
                options.set("maxStageSize", 20);
                break;
            case (Difficulty.EXPERT):
                options.set("stageLimit", 10);
                options.set("maxStageSize", 27);
                break;
            case (Difficulty.LEGEND):
                options.set("stageLimit", 12);
                options.set("maxStageSize", 33);
                break;
            case (Difficulty.ULTIMATE):
                options.set("stageLimit", 15);
                options.set("maxStageSize", 40);
                break;
        }
        return options.get(attr) || 5;
    }

    private stagesAreComplete(){
        for(const stage of this.stages){
            if(stage.stageDifficulty <= this.trackDifficulty){
                return false;
            }
        }
        return true;
    }

    private getRandomStages(){
        let stageLimit = this.getDifficultyOptions("stageLimit");
        let maxStageSize = this.getDifficultyOptions("maxStageSize");
        let randomStages = [] as StageObject[];
        let shuffledStages = this.shuffle(this.allStages);
        this.stageGeneratorInstance = this.getNextStageBySize(shuffledStages, maxStageSize);
        for (var i = 0; i < stageLimit; i++) {
            let stageDescription = this.stageGeneratorInstance.next().value || '';
            let newStage = this.getNewStageByDescription(stageDescription);
            randomStages.push(newStage);
        }
        return randomStages;
    }

    private getNewStageByDescription(stageDescription: string){
        let stageName = this.bookId + stageDescription;
        return {
            name: stageName, description: stageDescription, stageDifficulty: Difficulty.STARTER,
            stageCount: 0, answerRight: 0, answerWrong: 0
        } as StageObject;
    }

    private *getNextStageBySize(stages: string[], size: number){
        for(const stage of stages){
            if(stage.split(' ').length < size){
                yield stage;
            }
        }
        yield '';
    }

    private isStageComplete(stage: StageObject){
        return stage.stageDifficulty > this.trackDifficulty + 1;
    }

    protected setStageResponseIsRight(stageName: string, isRight: boolean | null) {
        this.trackMessage = "";
        let stage = this.findStage(stageName);
        if(stage){
            if(isRight !== null){
                if (stage && isRight){
                    stage.answerRight++;
                    this.trackStatus.answerRight++;
                    if(this.isStageComplete(stage)){
                        this.trackMessage = "Stage Complete!"
                        this.replaceCompleteStage(stage);
                    }
                } else if(stage && !isRight){
                    stage.answerWrong++;
                    this.trackStatus.answerWrong++;
                }
            }
            stage.stageDifficulty = this.getNextStageDifficulty(stage, isRight === null ? true : isRight);
        } else {
            console.log("Set stage response is right: stage not found.");
        }
    }

    protected getStageDifficulty(stageName: string) {
        let stage = this.findStage(stageName);
        return stage?.stageDifficulty;
    }

    protected getStageDescription(stageName: string) {
        let stage = this.findStage(stageName);
        return stage?.description;
    }

    private findStage(stageName: string) {
        return this.stages.find((stage) => stage.name == stageName);
    }

    private getNextStageDifficulty(stage: StageObject, answerRight: boolean){
        return answerRight ? this.increaseStageDifficulty(stage) : this.decreaseStageDifficulty(stage);
    }

    private increaseStageDifficulty(stage: StageObject) {
        // let the stage go one above the track difficulty
        switch (stage.stageDifficulty) {
            case (Difficulty.STARTER):
                return Difficulty.EASY;
            case (Difficulty.EASY):
                return Difficulty.MEDIUM;
            case(Difficulty.MEDIUM):
                return Difficulty.HARD;
            case(Difficulty.HARD):
                return Difficulty.LEGEND;
            case(Difficulty.LEGEND):
                return Difficulty.ULTIMATE;
        }
        return Difficulty.ULTIMATE;
    }
    private decreaseStageDifficulty(stage: StageObject) {
        switch (stage.stageDifficulty) {
            case (Difficulty.MEDIUM):
                return Difficulty.EASY;
            case (Difficulty.HARD):
                return Difficulty.MEDIUM;
            case(Difficulty.LEGEND):
                return Difficulty.HARD;
            case(Difficulty.ULTIMATE):
                return Difficulty.LEGEND;
        }
        return Difficulty.EASY;
    }

    private getStageDistribution(num: number) {
        let weights = this.stages.map((stage) => (1 / (stage.stageCount + 1)));
        let total_weight = this.sum(weights);
        let distribution = [];
        for (const stage of this.stages) {
            let weight = 1 / (stage.stageCount + 1);
            let p = weight / total_weight;
            let d = Math.round(p * num);
            distribution.push({ name: stage.name, count: d });
            num -= d;
            total_weight -= weight;
        }
        return distribution;
    }

    private sum(array: Array<number>) {
        let sum = 0;
        for (const number of array) {
            sum += number;
        }
        return sum;
    }

    private shuffle(array: any[]) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    }
}
