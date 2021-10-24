import { LitElement, html, css, property } from 'lit-element';
import { navigator } from 'lit-element-router';
import {Book, getBooks} from '../books/books.js';
import { Track } from '../track/track';
import { Difficulty } from '../enums/game';
/** 
* The wordsmith component works by creating stage instances and using a probability
* distribution to determine which stage type should appear in each stage instance. 
*
* The component serves the game to the user. The inputs are the user's guesses to each challenge/stage, and the output is an
* object representing the metrics of the performance on each stage. The output will be used by any parent components in order
* to track user progression.
*/

declare interface WordChallenge {
    // the string value of the word
    value: string;
    // whether the word is visible in the challenge
    visible: boolean;
}

export class Wordsmith extends Track {
    @property({ type: Object }) book: Book = {
        title: "",
        text: ""
    };
    @property({type: Array}) books: Book[] = [];
    @property({ type: String }) currentStage = "";

    static styles = css`
    .wordsmith-main {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60%;
        margin: auto;
    }
    .wordsmith-text-area{
        height: fit-content;
        height: -moz-fit-content;
        display: flex;
        flex-wrap: wrap;
        flex-grow: 3;
        width: 100%;
        align-content: flex-start;
        user-select: none;
        padding-bottom: 1em;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 22pt;
        margin: auto;
        justify-content: center;
    }
    `;

    firstUpdated(){
        document.addEventListener("keypress", (e:KeyboardEvent)=> {
            if(e.key == "Enter"){
                this.submitAnswer();
            }
        });
        this.selectBook();
        this.nextTrack();
    }
    private submitAnswer(){
        console.log("answer submitted");
        let answer = this.getUserAnswer();
        this.renderUserSuccessOrFail(this.isUserAnswerCorrect(answer));
        this.nextTrack();
    }
    private getUserAnswer(){
        //look through text area and parse answer
        return [];
    }
    private isUserAnswerCorrect(answer:string[]){
        //check against expected result
        return true;
    }
    private renderUserSuccessOrFail(isRight: boolean){
        //update a property to show errors or success message
    }

    private selectBook(bookId: String = '') {
        this.books = getBooks();
        //temp auto select
        this.book = this.books[0];
    }
    private getStagesFromBook(book: Book){
        //let splitBook = book.text.split("(?<=.)");
        let splitBook = book.text.split(".");
        splitBook = splitBook.map((sentence) => sentence = sentence.concat('.'));
        let stages = splitBook.filter((sentence) => sentence.split(' ').length > 5);
        let cleanStages = stages.map((stage) => stage.replace(/\'+|(\n)+|^\s+|\s+$|\s{2,}/g, '').trim());
        return cleanStages;
    }

    private nextTrack(round = 0){
        if(!this.book){ 
            console.log("No book selected." );
            return null;
        }
        if(round == 0){
            let stages = this.getStagesFromBook(this.book);
            this.loadStages(this.book.title.toString(), stages);
        }
        this.currentStage = this.stageInstance?.toString() || "";
    }

    private get stageChallenge() {
        let difficulty = this.getStageDifficulty(this.currentStage);
        let hiddenWordPercentage = 0;
        switch(difficulty){
            case(Difficulty.EASY):
                hiddenWordPercentage = 0.25;
                break;
            case(Difficulty.MEDIUM):
                hiddenWordPercentage = 0.33;
                break;
            case(Difficulty.HARD):
                hiddenWordPercentage = .5;
                break;
            case(Difficulty.EXPERT):
                hiddenWordPercentage = .66;
                break;
            case(Difficulty.LEGEND):
                hiddenWordPercentage = .75;
                break;
            case(Difficulty.ULTIMATE):
                hiddenWordPercentage = .8;
                break;
        }
        let stageDescription = this.getStageDescription(this.currentStage) || '';
        let words = stageDescription.split(' ');
        let hiddenWordCount = words.length * hiddenWordPercentage;
        let wordChallenge = this.getWordChallenge(words, hiddenWordCount);
        return wordChallenge;
    }

    private getWordChallenge(words: string[], n: number){
        let wordChallenge: WordChallenge[] = [];
        for(var i=0; i<words.length; i++){
            wordChallenge.push({value: words[i], visible: true});
        }
        let randomIndex = 0;
        while(n>0){
            randomIndex = Math.floor(Math.random() * words.length);
            wordChallenge[randomIndex].visible = false;
            n--;
        }
        return wordChallenge;
    }

    private checkValue(event: KeyboardEvent) {
    }

    render() {
        return html`
            <div class="wordsmith-main">
                <div class="wordsmith-text-area">
                    ${this.stageChallenge.map((word) => {
            if (word.visible) {
                return html`${word.value} `;
            } else {
                let wordSpace = new Array(word.value.length + 1).join(' ');
                return html`<textarea class=hidden-word>${wordSpace}</textarea>`
            }
        })}
                </div>
            </div>
        `;
    }
}

customElements.define('wordsmith-game', Wordsmith);