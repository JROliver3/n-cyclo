import { LitElement, html, css, property } from 'lit-element';
import { navigator } from 'lit-element-router';
import { Book, getBooks } from '../books/books.js';
import { Track, StageObject } from '../track/track';
import { Difficulty } from '../enums/game';
/** 
* The wordsmith component works by creating stage instances and using a probability
* distribution to determine which stage type should appear in each stage instance. 
*
* The component serves the game to the user. The inputs are the user's guesses to each challenge/stage, and the output is an
* object representing the metrics of the performance on each stage. The output will be used by any parent components in order
* to track user progression.
*/

/** 
 * A wordsmith stage is the stage that represents stages in wordsmith. It is composed of words, called stage words, that contain the 
 * set of words displayed as a question to the user. Each stage word has a value and a visible property which determines whether
 * it is visible or not to the user. Whether a stage word is visible or not is chosen based on random distribution and the performance
 * of the user.
 */ 
declare interface WordsmithStage extends StageObject{
    // word challenges of the word stage
    stageWords: StageWord[];
}

declare interface StageWord {
    // the string value of the word
    value: string;
    // whether the word is visible in the challenge
    visible: boolean;
}

declare interface ChallengeWord {
    // the html element of the active word
    element: HTMLElement;
    // the input for the challenge word 
    userInput: string;
    // whether the challenge word is currently active
    isActive: boolean;
}

export class Wordsmith extends Track {
    @property({ type: Object }) book: Book = {} as Book;
    @property({ type: Array }) books: Book[] = [] as Book[];
    @property({ type: Array }) challengeWords: ChallengeWord[] = [] as ChallengeWord[]; 
    @property({ type: Object }) currentStage: WordsmithStage = {} as WordsmithStage;

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
        place-content: flex-start;
        user-select: none;
        padding-bottom: 1em;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 22pt;
        margin: auto;
        justify-content: center;
        align-items: center;
    }
    .hidden-word, cursor{
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 22pt;
    }
    textarea:focus{
        border:none;
    }
    `;

    firstUpdated() {
        document.addEventListener("keypress", (e: KeyboardEvent) => {
            if (e.key == "Enter") {
                if(this.challengeWords.length != 0){
                    this.setNextActiveChallengeWord();
                } else {
                    this.submitAnswer();
                }
            } else if (e.key == "Backspace") {
                //this.userInput.substring(0, this.userInput.length - 2);
            } else {
                let challengeWord = this.getActiveChallengeWord();
                if(challengeWord){
                    challengeWord.userInput += e.key;
                    this.setChallengeWordUserInput(challengeWord, e.key);
                }
            }
        });
        this.selectBook();
        this.nextTrack();
        this.activateCursor();
    }

    updated() {
        this.setChallengeWords();
        this.updateChallengeWords();
    }
    //used on enter if there are more challenge words
    private setNextActiveChallengeWord(){
        for(var i=0; i<this.challengeWords.length; i++){
            if(this.challengeWords[i].isActive){
                if(i < this.challengeWords.length-1){
                    this.challengeWords[i].isActive = false;
                    this.setActiveChallengeWord(this.challengeWords[i+1]);
                }
            }
        }
    }

    private setChallengeWordUserInput(challengeWord:ChallengeWord, userInput: string){
        let updatedChallengeWord = {} as ChallengeWord;
        updatedChallengeWord.element = challengeWord.element;
        updatedChallengeWord.isActive = challengeWord.isActive;
        updatedChallengeWord.userInput = challengeWord.userInput + userInput;
        
    }

    private getActiveChallengeWord(){
        for(const challengeWord of this.challengeWords){
            if(challengeWord.isActive){
                return challengeWord;
            }
        }
        return this.challengeWords[0];
    }

    private get hiddenWords(){
        return this.shadowRoot!.querySelectorAll('.hidden-word');
    }

    private updateChallengeWords(){
        let updatedChallengeWords = [] as ChallengeWord[];
        let updateNeeded = false;
        for(let challengeWord of this.challengeWords){
            let updatedChallengeWord = this.updateChallengeWordInput(challengeWord);
            if(updatedChallengeWord.userInput != challengeWord.userInput){
                updatedChallengeWords.push(updatedChallengeWord);
                updateNeeded = true;
            } else {
                updatedChallengeWords.push(challengeWord);
            }
        }
        if(updateNeeded){
            this.challengeWords = [...updatedChallengeWords];
        }
    }

    private updateChallengeWordInput(challengeWord: ChallengeWord){
        if(challengeWord && challengeWord.element){
            challengeWord.element.insertAdjacentHTML('afterbegin', `<div id="cursor">${challengeWord.userInput}|</div>`);
        }
        return challengeWord;
    }

    private removeCurrentCursor(){
        let cursor = this.shadowRoot!.querySelector('#cursor') as HTMLElement;
        if(cursor){ cursor.remove(); }
    }

    private activateCursor() {
        let cursor = true;
        let speed = 220;
        setInterval(() => {
            let cursorElement = this.shadowRoot!.getElementById('cursor');
            if (!cursorElement) { return; }
            if (cursor) {
                cursorElement.style.opacity = "0";
                cursor = false;
            } else {
                cursorElement.style.opacity = "1";
                cursor = true;
            }
        }, speed);
    }
    // TODO: break up into more atomic methods
    private submitAnswer() {
        let answer = this.getUserAnswer();
        let isUserAnswerCorrect = this.isUserAnswerCorrect(answer);
        this.setStageResponseIsRight(this.currentStage.name, isUserAnswerCorrect);
        this.renderUserSuccessOrFail(isUserAnswerCorrect);
        this.nextTrack(this.round);
    }
    private getUserAnswer() {
        //look through text area and parse answer
        return [];
    }
    private isUserAnswerCorrect(answer: string[]) {
        //check against expected result
        return true;
    }
    private renderUserSuccessOrFail(isRight: boolean) {
        //update a property to show errors or success message
    }

    private selectBook(bookId: String = '') {
        this.books = getBooks();
        //temp auto select
        this.book = this.books[0];
    }
    private getStagesFromBook(book: Book) {
        //let splitBook = book.text.split("(?<=.)");
        let splitBook = book.text.split(".");
        splitBook = splitBook.map((sentence) => sentence = sentence.concat('.'));
        let stages = splitBook.filter((sentence) => sentence.split(' ').length > 5);
        let cleanStages = stages.map((stage) => stage.replace(/\'+|(\n)+|^\s+|\s+$|\s{2,}/g, '').trim());
        return cleanStages;
    }

    private nextTrack(round = 0) {
        if (!this.book) {
            console.log("No book selected.");
            return null;
        }
        if (round == 0) {
            let stages = this.getStagesFromBook(this.book);
            this.loadStages(this.book.title.toString(), stages);
        }
        this.challengeWords = [] as ChallengeWord[];
        this.currentStage.name = this.stageInstance?.toString() || "";
        this.currentStage.stageWords = this.getStageWordsFromStage(this.currentStage);
    }

    private setChallengeWords(){
        //hiddenWords property should be updated due to stageWords being updated 
        let hiddenWordElements = this.hiddenWords;
        for(var i=0; i<hiddenWordElements.length; i++){
            let challengeWord = {} as ChallengeWord;
            challengeWord.element = hiddenWordElements[i] as HTMLElement;
            challengeWord.userInput = "";
            if(i==0){ 
                this.setActiveChallengeWord(challengeWord);
            }
            this.challengeWords.push(challengeWord);
        }
    }

    private setActiveChallengeWord(challengeWord: ChallengeWord){
        challengeWord.isActive = true;
        this.removeCurrentCursor();
        this.updateChallengeWordInput(challengeWord);
    }

    private getStageWordsFromStage(currentStage: WordsmithStage) {
        let difficulty = this.getStageDifficulty(currentStage.name);
        let hiddenWordPercentage = 0;
        switch (difficulty) {
            case (Difficulty.EASY):
                hiddenWordPercentage = 0.25;
                break;
            case (Difficulty.MEDIUM):
                hiddenWordPercentage = 0.33;
                break;
            case (Difficulty.HARD):
                hiddenWordPercentage = .5;
                break;
            case (Difficulty.EXPERT):
                hiddenWordPercentage = .66;
                break;
            case (Difficulty.LEGEND):
                hiddenWordPercentage = .75;
                break;
            case (Difficulty.ULTIMATE):
                hiddenWordPercentage = .8;
                break;
        }
        let stageDescription = this.getStageDescription(currentStage.name) || '';
        let words = stageDescription.split(' ');
        let hiddenWordCount = words.length * hiddenWordPercentage;
        let stageWordChallenge = this.getStageWordChallenge(words, hiddenWordCount);
        return stageWordChallenge;
    }

    private getStageWordChallenge(words: string[], n: number) {
        let stageWord: StageWord[] = [];
        for (var i = 0; i < words.length; i++) {
            stageWord.push({ value: words[i], visible: true });
        }
        let randomIndex = 0;
        while (n > 0) {
            randomIndex = Math.floor(Math.random() * words.length);
            stageWord[randomIndex].visible = false;
            n--;
        }
        return stageWord;
    }

    private checkValue(event: KeyboardEvent) {
    }

    render() {
        return html`
            <div class="wordsmith-main">
                <div class="wordsmith-text-area">
                    ${this.currentStage.stageWords ? this.currentStage.stageWords.map((word) => {
            if (word.visible) {
                return html`${word.value} `;
            } else {
                //let wordSpace = new Array(word.value.length + 1 - this.userInput.length).fill(' ').join('');
                return html`<div class=hidden-word></div>`
                // return html`
                // <div class="hidden-word">${word.value.split('').map((letter) => {
                //     return html`<div class="hidden-word-letter" @insert="${this.insertActiveLetter(letter)}"> </div>`
                // })}
                // </div>`
            }
        }): ''}
                </div>
            </div>
        `;
    }
}

customElements.define('wordsmith-game', Wordsmith);