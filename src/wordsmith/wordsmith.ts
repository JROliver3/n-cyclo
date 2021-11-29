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
    // whether the stage has errors or not
    hasErrors: Boolean;
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
    @property({ type: Boolean }) pause: boolean = false;
    @property({ type: Object }) userAnswerMap: Map<number, string> = new Map<number, string>();
    @property({ type: Object }) menuSelectionMap: Map<string, Map<string, boolean>> = new Map<string, Map<string, boolean>>([
        ["word", new Map<string, boolean>([["words", true]])],["sequence", new Map<string, boolean>([["random", true]])], ["difficulty",new Map<string, boolean>([["easy", true]])], ["questions", new Map<string, boolean>([["two", true]])], ["progression", new Map<string, boolean>([["progress", false]])]
    ]);

    static styles = css`
    .wordsmith-main {
        align-items: center;
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
        padding-top: 1em;
        /* font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; */
        font-family: consolas;
        font-size: 22pt;
        margin: auto;
        justify-content: center;
        align-items: center;
    }
    .hidden-word, cursor{
        /* font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; */
        font-family: consolas;
        font-size: 22pt;
    }
    textarea:focus{
        border:none;
    }
    .user-input, .user-answer{
        display: flex;
        margin: 10px;
        font-size: 22pt;
    }
    .user-input-correct{
        text-decoration: underline;
        text-decoration-color: #04ab04;
    }
    .user-input-incorrect{
        text-decoration: underline;
        text-decoration-color: #cf2424;
    }
    #cursor {
        font-weight: 100;
        font-size: 30px;
        margin: -1px -6px -1px;
        height: 0;
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
    .row-option{
        opacity:60%;
        font-size: 14px;
        margin-right: 10px;
    }
    .row-option:hover, .row-option-selected:hover{
        opacity: 100%;
        cursor:pointer;
    }
    .row-option-selected{
        opacity: 100%;
        font-size: 14px;
        margin-right: 10px;
    }
    .row-option-static{
        opacity:60%;
        font-size: 14px;
        margin-right: 10px;
    }
    .menu-row{
        display: flex;
        justify-content: end;
    }
    .wordsmith-menu-options{
        position: absolute;
        bottom: 0;
        right: 0;
        margin-bottom: 50px;
        margin-right:21%;
    }
    .wordsmith-widget{
        /* margin: 10px; */
        height:10px;
        display:flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 20px;
    }
    #refresh-button{
        opacity: 60%
    }
    #refresh-button:hover{
        opacity: 100%;
        cursor: pointer;
    }
    .stage-status, track-status{
        opacity: 60%;
    }
    `;

    private difficultyMap: Map<string, Difficulty> = new Map<string, Difficulty>([["easy", Difficulty.EASY], ["medium", Difficulty.MEDIUM], ["hard", Difficulty.HARD], ["legend", Difficulty.LEGEND], ["ultimate", Difficulty.ULTIMATE], ["expert", Difficulty.EXPERT], ["starter", Difficulty.STARTER]]);

    firstUpdated() {
        this.addEventListeners();
        this.selectBook();
        this.nextTrack();
    }

    private addEventListeners(){
        document.addEventListener("keypress", (e: KeyboardEvent) => {
            if (e.key == "Enter" || e.key == " ") {
                if(this.getRemainingInactiveQuestionCount() > 0){
                    this.activeQuestionIndex++;
                } else if(e.key != " ") {
                    if(this.userAnswerMap.size > 0){
                        this.pause = !this.pause;
                        this.activeQuestionIndex++;
                    }
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
                if(this.pause){ return; }
                let activeQuestionInput = this.userAnswerMap.get(this.activeQuestionIndex) || '';
                if(activeQuestionInput.length > 0){
                    activeQuestionInput = activeQuestionInput.substring(0, activeQuestionInput.length - 1);
                    if(!this.updateUserAnswerMap(activeQuestionInput, this.activeQuestionIndex)){
                        console.log("User answer map update failed.");
                    }
                } else {
                    if(this.activeQuestionIndex > 0){
                        this.activeQuestionIndex--;
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
        let isUserAnswerCorrect = null;
        if(this.userAnswerMap.size > 0){
            isUserAnswerCorrect = !this.currentStage.hasErrors;
        }
        if(this.pause){
            this.updateTrackMessage(this.currentStage.name, isUserAnswerCorrect);
            return;
        }
        this.setStageResponseIsRight(this.currentStage.name, isUserAnswerCorrect);
        this.nextTrack(this.round);
    }

    private isUserAnswerCorrect(userAnswer: string, correctAnswer:string) {
        //check against expected result, removing special characters.
        return userAnswer.replace(/[^a-zA-Z ]/g, "").toLowerCase() == correctAnswer.replace(/[^a-zA-Z ]/g, "").toLowerCase();
    }

    private selectBook(bookId: String = '') {
        this.books = getBooks();
        //temp auto select
        this.book = this.books[3];
    }
    private getStagesFromBook(book: Book) {
        //let splitBook = book.text.split("(?<=.)");
        let splitBook = book.text.split(book.delimiter.toString());
        splitBook = splitBook.map((sentence) => {
            if(sentence[sentence.length - 1] != '.'){
                return sentence.concat('.');
            } else {
                return sentence;
            }
        });
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
            let trackDifficulty = this.getTrackDifficulty();
            this.loadStages(this.book.title.toString(), stages, this.difficultyMap.get(trackDifficulty));
        }
        this.userAnswerMap = new Map<number, string>();
        this.currentStage.name = this.stageInstance?.toString() || "";
        this.currentStage.stageWords = this.getStageWordsFromStage(this.currentStage);
        this.activeQuestionIndex = 0;
    }

    private getTrackDifficulty(){
        let currentDifficulty = this.menuSelectionMap.get("difficulty");
        let trackDifficulty = "";
        if(currentDifficulty){
            for(const key of currentDifficulty.keys()){
                if(currentDifficulty.get(key)){
                    trackDifficulty = key;
                }
            }
        }
        return trackDifficulty;
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
            let correct = this.isUserAnswerCorrect(truncatedUserInput, word.value);
            let questionInput = "";
            let inputId =  correct ? "user-input-correct" : "user-input-incorrect";
            if(!correct){ this.currentStage.hasErrors = true; }
            if(!this.pause){ questionInput = truncatedUserInput+wordSpace; } else { questionInput = word.value; }
            return html` <div class="user-input ${inputId}">${questionInput}</div>`;
        } else if (elementIndex == this.activeQuestionIndex){
            return html` <div class="user-input">${truncatedUserInput}<div id="cursor">|</div>${wordSpace}</div>`;
        } else if (elementIndex > this.activeQuestionIndex){
            return html` <div class="user-input">${truncatedUserInput}${wordSpace}</div>`;
        }
        return ``;
    }

    private selectOption(e:Event, callback: Function | null = null){
        let element = e.target as HTMLElement;
        let parent = element.parentElement as HTMLElement;
        let children = parent.children;
        let updatedMenuMap = new Map<string, Map<string, boolean>>();
        for(const key of this.menuSelectionMap.keys()){
            updatedMenuMap.set(key, this.menuSelectionMap.get(key) || new Map<string, boolean>());
        }
        updatedMenuMap.get(parent.id)?.set(element.id, true);
        for(var i=0; i<children.length; i++){
            if(children[i].id != element.id){
                updatedMenuMap.get(parent.id)?.set(children[i].id, false);
            }
        }
        this.menuSelectionMap = updatedMenuMap;
        if(callback){ callback(); }
    }

    private getSelectedOption(parentId: string, childId:string){
        if(!this.menuSelectionMap.get(parentId)?.get(childId)){
            return "row-option";
        } else {
            return "row-option-selected";
        }
    }

    private resetTrack(){
        this.round = 0;
        this.pause = false;
        this.trackStatus.answerRight = 0;
        this.trackStatus.answerWrong = 0;
    }

    private reloadTrack(){
        this.resetTrack();
        this.nextTrack();
    }

    private getWidgetContents(){
        if(!this.pause){
            return  html`<img id="refresh-button" src="../../assets/refresh-4.svg" width="20" height="20" @click=${()=>this.reloadTrack()}></img>`
        } else {
            if(this.currentStage.hasErrors){
                return html`<div class="stage-status">Incorrect...</div>
                <div class="track-message">${this.trackMessage}</div>`;
            } else {
                return html`Correct!<div>${this.trackMessage}</div>`;
            }
        }
    }

    private getAnsweredRightCount(){
        return this.trackStatus.answerRight;
    }
    private getAnsweredWrongCount(){
        return this.trackStatus.answerWrong;
    }

    private isProgressSelected(){
        return this.menuSelectionMap.get("progression")?.get("progress") || false;
    }

    render() {
        let hiddenWordIndex = 0;
        this.currentStage.hasErrors = false;
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
                <div class="wordsmith-widget">${this.getWidgetContents()}</div>
                <div class="wordsmith-menu-options" @click="${this.selectOption}">
                    <div class="word-time-row menu-row" id="word">
                        <div class="words-option ${this.getSelectedOption("word", "words")}" id="words">Words</div>
                        <div class="timed-option ${this.getSelectedOption("word", "timed")}" id="timed">Timed</div>
                    </div>
                    <div class="sequence-row menu-row" id="sequence">
                        <div class="sequential-option ${this.getSelectedOption("sequence", "sequential")}" id="sequential">Sequential</div>
                        <div class="random-option ${this.getSelectedOption("sequence", "random")}" id="random">Random</div>
                    </div>
                    <div class="difficulty-row menu-row" id="difficulty">
                        <div class="easy-option ${this.getSelectedOption("difficulty", "easy")}" id="easy" @click="${(e:Event)=>this.selectOption(e, ()=>this.reloadTrack())}">Easy</div>
                        <div class="medium-option ${this.getSelectedOption("difficulty", "medium")}" id="medium" @click="${(e:Event)=>this.selectOption(e, ()=>this.reloadTrack())}">Medium</div>
                        <div class="hard-option ${this.getSelectedOption("difficulty", "hard")}" id="hard" @click="${(e:Event)=>this.selectOption(e, ()=>this.reloadTrack())}">Hard</div>
                    </div>
                    <div class="question-count-row menu-row" id="questions">
                        <div class="1-option ${this.getSelectedOption("questions","one")}" id="one">1</div>
                        <div class="2-option ${this.getSelectedOption("questions", "two")}" id="two">2</div>
                        <div class="5-option ${this.getSelectedOption("questions", "five")}" id="five">5</div>
                        <div class="7-option ${this.getSelectedOption("questions", "seven")}" id="seven">7</div>
                        <div class="10-option ${this.getSelectedOption("questions", "ten")}" id="ten">10</div>
                    </div>
                    <div class="progress-row menu-row" id="progression">
                        <div class="progress-option ${this.getSelectedOption("progression", "progress")}" id="progress" style="display:block;" @click="${(e:Event)=>this.selectOption(e)}">Progress</div>
                    </div>
                    <div class="count-row menu-row" id="count">
                        <div class="answered-right-count row-option-static" id="correct" .hidden="${!this.isProgressSelected()}">Correct: ${this.getAnsweredRightCount()}</div>
                        <div class="answered-wrong-count row-option-static" id="incorrect" .hidden="${!this.isProgressSelected()}">Incorrect: ${this.getAnsweredWrongCount()}</div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('wordsmith-game', Wordsmith);