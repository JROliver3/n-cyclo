import { LitElement, property } from 'lit-element';
import { StageObject } from '../interfaces/stageInterface';
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
*/


export declare interface TrackStatus {
    // name of the track being run
    name: string;

}

export class Track extends LitElement {
    @property({ type: Array }) stages: StageObject[] = [];
    @property({ type: Array }) stageBuffer: string[] = [];
    @property({ type: Number }) trackDifficulty: Difficulty = 0;
    @property({ type: Number }) instanceCount = 0;
    @property({ type: Number }) round = 0;

    protected get stageInstance() {
        if (this.stageBuffer.length == 0) {
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
    protected loadStages(bookId: string, allStages: string[], trackDifficulty = Difficulty.MEDIUM) {
        let stageLimit = 0;
        switch (trackDifficulty) {
            case (Difficulty.EASY):
                stageLimit = 5;
                break;
            case (Difficulty.MEDIUM):
                stageLimit = 10;
                break;
            case (Difficulty.HARD):
                stageLimit = 15;
                break;
            case (Difficulty.EXPERT):
                stageLimit = 20;
                break;
            case (Difficulty.LEGEND):
                stageLimit = 25;
                break;
            case (Difficulty.ULTIMATE):
                stageLimit = 30;
                break;
        }
        let shuffledStages = this.shuffle(allStages);
        for (var i = 0; i < stageLimit; i++) {
            let stageDescription = shuffledStages[i];
            let stageName = bookId + stageDescription;
            this.stages.push({ name: stageName, description: stageDescription, stageDifficulty: Difficulty.STARTER, stageCount: 0 });
        }
    }

    protected getStageDifficulty(stageName: string){
        let stage = this.stages.find((stage) => stage.name == stageName);
        return stage?.stageDifficulty;
    }

    protected getStageDescription(stageName: string){
        let stage = this.stages.find((stage) => stage.name == stageName);
        return stage?.description;
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
