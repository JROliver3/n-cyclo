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
    @property({ type: Number }) activeQuestionIndex: number = 0;
    @property({ type: Object }) userAnswerMap: Map<number, string> = new Map<number, string>();

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
    #user-input, #user-answer{
        display: flex;
        margin: 10px;
    }
    #cursor {
  font-weight: 100;
  font-size: 30px;
  color: #2E3D48;
  -webkit-animation: 1s blink step-end infinite;
  -moz-animation: 1s blink step-end infinite;
  -ms-animation: 1s blink step-end infinite;
  -o-animation: 1s blink step-end infinite;
  animation: 1s blink step-end infinite;
}

@keyframes blink {
  from, to {
    color: transparent;
  }
  50% {
    color: black;
  }
}

@-moz-keyframes blink {
  from, to {
    color: transparent;
  }
  50% {
    color: black;
  }
}

@-webkit-keyframes blink {
  from, to {
    color: transparent;
  }
  50% {
    color: black;
  }
}

@-ms-keyframes blink {
  from, to {
    color: transparent;
  }
  50% {
    color: black;
  }
}

@-o-keyframes blink {
  from, to {
    color: transparent;
  }
  50% {
    color: black;
  }
}
    `;

    firstUpdated() {
        this.addEventListeners();
        this.selectBook();
        this.nextTrack();
        // this.activateCursor();
    }

    private addEventListeners(){
        document.addEventListener("keypress", (e: KeyboardEvent) => {
            if (e.key == "Enter") {
                if(this.getRemainingInactiveQuestionCount() > 0){
                    this.activeQuestionIndex++;
                } else {
                    this.submitAnswer();
                }
            } else if(e.key != " ") {
                if(this.userAnswerMap.get(this.activeQuestionIndex) === undefined){
                    this.userAnswerMap.set(this.activeQuestionIndex, "");
                }
                let activeQuestionInput = this.userAnswerMap.get(this.activeQuestionIndex) + e.key;
                if(!this.updateUserAnswerMap(activeQuestionInput, this.activeQuestionIndex)){
                    console.log("User answer map update failed.");
                };
            }
        });
        document.addEventListener("keydown", (e: KeyboardEvent)  => {
            if (e.key == "Backspace") {
                let activeQuestionInput = this.userAnswerMap.get(this.activeQuestionIndex) || '';
                if(activeQuestionInput.length > 0){
                    activeQuestionInput = activeQuestionInput.substring(0, activeQuestionInput.length - 1);
                    if(!this.updateUserAnswerMap(activeQuestionInput, this.activeQuestionIndex)){
                        console.log("User answer map update failed.");
                    }
                }
            }
        });
    }

    private updateUserAnswerMap(questionInput: string, elementIndex: number){
        let updatedAnswerMap = new Map<number, string>();
        for(const key of this.userAnswerMap.keys()){
            updatedAnswerMap.set(key, this.userAnswerMap.get(key) || '');
        }
        updatedAnswerMap.set(elementIndex, questionInput);
        this.userAnswerMap = updatedAnswerMap;
        return true;
    }

    private getRemainingInactiveQuestionCount(){
        let questionCount = 0;
        for(const stageWord of this.currentStage.stageWords){
            if(!stageWord.visible){
                questionCount++;
            }
        }
        return questionCount - (this.activeQuestionIndex + 1);
    }

    private truncateUserInput(inputLength: number, userInput: string){
        let input = userInput;
        if(inputLength < input.length){
            input = input.substring(0, inputLength);
        }
        return input;
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
        this.activeQuestionIndex = 0;
        this.userAnswerMap = new Map<number, string>();
        this.currentStage.name = this.stageInstance?.toString() || "";
        this.currentStage.stageWords = this.getStageWordsFromStage(this.currentStage);
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

    private getQuestionElementClassName(elementIndex: number) {
        if(elementIndex < this.activeQuestionIndex){
            return "hidden-word-done";
        } else if(elementIndex == this.activeQuestionIndex){
            return "hidden-word-active";
        } else if(elementIndex > this.activeQuestionIndex){
            return "hidden-word";
        }
        return "";
    }

    private getQuestionElementContent(elementIndex: number, word: StageWord){
        let userInput = this.userAnswerMap.get(elementIndex) || '';
        let inputLength = word.value.length;
        let truncatedUserInput = this.truncateUserInput(inputLength, userInput);
        if(!this.updateUserAnswerMap(truncatedUserInput, elementIndex)){
            console.log("getQuestionElementContent failed to update the user answer map.");
            return null;
        };
        let wordSpace = new Array(word.value.length - truncatedUserInput.length).fill('_').join('');
        if (elementIndex < this.activeQuestionIndex){
            return html` <div id="user-input">${truncatedUserInput}${wordSpace}</div>`;
        } else if (elementIndex == this.activeQuestionIndex){
            return html` <div id="user-input">${truncatedUserInput}<div id="cursor">|</div>${wordSpace}</div>`;
        } else if (elementIndex > this.activeQuestionIndex){
            return html` <div id="user-input">${truncatedUserInput}${wordSpace}</div>`;
        }
        return ``;
    }

    render() {
        let hiddenWordIndex = 0;
        return html`
            <div class="wordsmith-main">
                <div class="wordsmith-text-area">
                    ${this.currentStage.stageWords ? this.currentStage.stageWords.map((word) => {
            if (word.visible) {
                return html`${word.value} `;
            } else {
                let currentIndex = hiddenWordIndex;
                hiddenWordIndex++;
                return html`<div class="${this.getQuestionElementClassName(currentIndex)}">${this.getQuestionElementContent(currentIndex, word)}</div>`;
            }
        }): ''}
                </div>
            </div>
        `;
    }
}

customElements.define('wordsmith-game', Wordsmith);