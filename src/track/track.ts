import { LitElement, html, css, property } from 'lit-element';
import { navigator } from 'lit-element-router';

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

declare interface StageMapObject {
    name: string;
    count: number;
}


export class Track extends LitElement {
    @property({type: Array}) stages = [];
    @property({type: Array}) stageBuffer: string[] = [];
    @property({type: Array}) stageMap: StageMapObject[] = [];
    @property({type: Number}) instanceCount = 0;
    @property({type: Number}) round = 0;

    protected get stageInstance(){
        if(this.stageBuffer.length == 0){
            let instanceDistribution = this.getStageDistribution(10);
            for(const stage of instanceDistribution){
                for(var i=0; i<stage.count; i++){
                    this.stageBuffer.push(stage.name);
                    this.stageBuffer = this.shuffle(this.stageBuffer);
                }
            }
        }
        let instance = this.stageBuffer.pop();
        let stageMapInstance = this.stageMap.find((value)=>value.name === instance);
        if(stageMapInstance){stageMapInstance.count++;}
        return instance;
    }

    private getStageDistribution(num: number){
        let weights = this.stageMap.map((stage) => 1/stage.count);
        let total_weight = this.sum(weights);
        let distribution = [];
        for(const stage of this.stageMap){
            let weight = 1/stage.count;
            let p = weight / total_weight;
            let d = Math.round(p * num);
            distribution.push({name:stage.name, count: d});
            num -= d;
            total_weight -= weight;
        }
        return distribution;
    }

    private sum(array: Array<number>){
        let sum = 0;
        for(const number of array){
            sum += number;
        }
        return sum;
    }

    //Unbiased Fisher-Yates (aka Knuth) shuffle algorithm
    private shuffle(array: string[]) {
        let currentIndex = array.length,  randomIndex;
      
        while (currentIndex != 0) {
      
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      }
}
 