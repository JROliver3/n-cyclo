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


export class Wordsmith extends Track {
    @property({ type: Object }) book: Book = {} as Book;
    @property({ type: Array }) books: Book[] = [] as Book[];
    @property({ type: Object }) currentStage: WordsmithStage = {} as WordsmithStage;
    @property({ type: String }) userInput: String = "";

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
    .hidden-word{
        display: flex;
        margin: 10px;
    }
    .hidden-word, cursor{
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 22pt;
    }
    textarea:focus{
        border:none;
    }
    #user-input, #user-answer{
        display: flex;
        margin: 10px;
    }
    `;

    firstUpdated() {
        this.addEventListeners();
        this.selectBook();
        this.nextTrack();
        this.setNextActiveQuestion();
        this.activateCursor();
    }

    updated() {
        this.updateInactiveQuestions();
        this.setInitialActiveQuestion();
        this.updateActiveQuestion();
    }


    private addEventListeners(){
        document.addEventListener("keypress", (e: KeyboardEvent) => {
            if (e.key == "Enter") {
                if(this.hiddenWords.length > 0){
                    this.setNextActiveQuestion();
                } else {
                    this.submitAnswer();
                }
            } else if(e.key != " ") {
                let userInputUpdate = this.userInput + e.key;
                if(this.checkUserInputLength(userInputUpdate)){
                    this.userInput = userInputUpdate;
                }
            }
        });
        document.addEventListener("keydown", (e: KeyboardEvent)  => {
            if (e.key == "Backspace") {
                if(this.userInput.length > 0){
                    this.userInput = this.userInput.substring(0, this.userInput.length - 1);
                }
            }
        });
    }

    private updateInactiveQuestions(){
        this.hiddenWords.forEach(el => {
            let inputElement = el as HTMLInputElement;
            let spacing = parseInt(inputElement.value);
            let wordSpace = new Array(spacing).fill('_').join('');
            el.innerHTML = wordSpace;
        });
    }

    private setInitialActiveQuestion(){
        let activeQuestion = this.shadowRoot!.querySelector('.hidden-word-active') as HTMLElement;
        if(!activeQuestion){
            let pendingQuestions = this.hiddenWords;
            if(pendingQuestions.length > 0){
                let nextActiveQuestion = pendingQuestions[0] as HTMLElement;
                nextActiveQuestion.className = "hidden-word-active";
                nextActiveQuestion.innerHTML = "";
            }
        }
    }

    private checkUserInputLength(userInput: string){
        let activeQuestion = this.shadowRoot!.querySelector('.hidden-word-active') as HTMLInputElement;
        if(activeQuestion){
            let remainingSpace = parseInt(activeQuestion.value);
            if(remainingSpace >= userInput.length){
                return true;
            } else {
                return false;
            }
        } 
        return false;
    }

    private setNextActiveQuestion(){
        let activeQuestion = this.shadowRoot!.querySelector('.hidden-word-active') as HTMLInputElement;
        if(activeQuestion) {
            activeQuestion.className = "hidden-word-done";
            this.removeCurrentCursor();
            activeQuestion.innerHTML = `<div id="user-answer">${this.userInput.toString()}</div>`;
        }
        let pendingQuestions = this.hiddenWords;
        if (pendingQuestions.length > 0){
            this.userInput = "";
            let nextActiveQuestion = pendingQuestions[0] as HTMLInputElement;
            let remainingSpace = parseInt(nextActiveQuestion.value);
            nextActiveQuestion.innerHTML = "";
            nextActiveQuestion.className = "hidden-word-active";
            let wordSpace = new Array(remainingSpace - (this.userInput.length - 1)).fill('_').join('');
            nextActiveQuestion.insertAdjacentHTML('afterbegin', `<div id="user-input">${this.userInput}<div id="cursor">|</div>${wordSpace}</div>`);
        }
    }

    private updateActiveQuestion(){
        let activeQuestion = this.shadowRoot!.querySelector('.hidden-word-active') as HTMLInputElement;
        if(activeQuestion){
            let remainingSpace = parseInt(activeQuestion.value);
            if(remainingSpace >= this.userInput.length - 1){
                this.removeCurrentCursor();
                let wordSpace = new Array(remainingSpace - this.userInput.length).fill('_').join('');
                activeQuestion.insertAdjacentHTML('afterbegin', `<div id="user-input">${this.userInput}<div id="cursor">|</div>${wordSpace}</div>`);
            }
        }
    }

    private get hiddenWords(){
        return this.shadowRoot!.querySelectorAll('.hidden-word');
    }

    private removeCurrentCursor(){
        let cursor = this.shadowRoot!.querySelector('#user-input') as HTMLElement;
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
        this.userInput = "";
        this.currentStage.name = this.stageInstance?.toString() || "";
        this.currentStage.stageWords = this.getStageWordsFromStage(this.currentStage);
        this.setNextActiveQuestion();
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

    render() {
        return html`
            <div class="wordsmith-main">
                <div class="wordsmith-text-area">
                    ${this.currentStage.stageWords ? this.currentStage.stageWords.map((word) => {
            if (word.visible) {
                return html`${word.value} `;
            } else {
                return html`<div class="hidden-word" .value="${word.value.length}"></div>`;
            }
        }): ''}
                </div>
            </div>
        `;
    }
}

customElements.define('wordsmith-game', Wordsmith);