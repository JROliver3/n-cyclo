import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { Book, getBooks } from '../books/books.js';
import { Track, StageObject } from '../track/track';
import { Difficulty, State } from '../enums/game';
import { isMobile } from '../util/window';
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
declare interface WordsmithStage extends StageObject {
    // word challenges of the word stage
    stageWords: StageWord[];
    // words answered correctly in the stage
    wordsCorrect: number;
    // words answered incorrectly in the stage
    wordsIncorrect: number;
    // pending questions for stage
    pendingQuestionCount: number;
    // finished questions for stage
    finishedQuestionCount: number;
    // total number of questions for stage
    totalQuestionCount: number;
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
    @property({ type: Number }) totalWordsIncorrect: number = 0;
    @property({ type: Number }) totalWordsCorrect: number = 0;
    @property({ type: Boolean }) pause: boolean = false;
    @property({ type: Boolean }) showMenu: boolean = true;
    @property({ type: Object }) userAnswerMap: Map<number, string> = new Map<number, string>();
    @property({ type: Object }) menuSelectionMap: Map<string, Map<string, boolean>> = new Map<string, Map<string, boolean>>([
        ['focus-mode', new Map<string, boolean>([['focus', false]])],
        ['word', new Map<string, boolean>([['words', true]])],
        ['word-count', new Map<string, boolean>([['30', true]])],
        ['sequence', new Map<string, boolean>([['random', true]])],
        ['difficulty', new Map<string, boolean>([['easy', true]])],
        ['questions', new Map<string, boolean>([['two', true]])],
        ['progression', new Map<string, boolean>([['progress', false]])],
    ]);

    static styles = css`
    .wordsmith-main {
        align-items: center;
        width: 80%;
        margin: auto;
    }
    @media(min-width: 768px){
        .wordsmith-main {
            align-items: center;
            width: 60%;
            margin: auto;
        }
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
        font-family: monospace;
        font-size: 22pt;
        margin: auto;
        justify-content: center;
        align-items: center;
    }
    .wordsmith-track{
        margin-top: -50px;
    }
    .hidden-word, cursor{
        font-family: monospace;
        font-size: 22pt;
    }
    .hidden-word, .hidden-word-active, .hidden-word-done{
        display:flex;
    }
    textarea:focus{
        border:none;
    }
    .user-input, .user-answer{
        display: flex;
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
        justify-content: center;
    }
    @media(min-width: 768px){
        .menu-row{
            justify-content: end;
        }
    }
    .wordsmith-menu-options{
            position: absolute;
            bottom: 100px;
            right: 50%;
            left: 50%
        }
    @media(min-width: 768px){
        .wordsmith-menu-options{
            position: absolute;
            bottom: 0;
            right: 0;
            margin-bottom: 50px;
            margin-right:21%;
        }
    }
    .wordsmith-widget{
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
    .wordsmith-results-modal{
    margin-top: -50;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    .result-title{
        font-size: 60px;
        text-align: center;
        opacity: 60%;
    }

    .options-array{
        text-align: center;
        font-size: 18px;
    }
    .results{
        display: flex;
        padding:20px;
    }
    .result-col-1, .result-col-2{
        width:50%;
    }
    .result-col-1{
        margin-right:-20px;
    }
    .result-col-2{
            margin-left:60px;
        }
    @media(min-width: 780px){
        .result-col-2{
            margin-left:80px;
        }
    }
    .col-1-row-1, .col-1-row-2, .col-2-row-1, .col-2-row-2{
        display: flex;
        align-items: baseline;
        justify-content: end;
    }
    .col-1-row-1-col-2{
        font-size: 28px;
        margin-left: 15px;
    }
    @media(min-width: 780px){
        .col-1-row-1-col-2{
            margin-left: 20px;
        }
    }
    .col-1-row-2-col-2{
        font-size: 22px;
        opacity: 80%;
        margin-left: 20px;
    }
    .col-1-row-1-col-1, .col-1-row-2-col-1{
        font-size:22px;
        opacity:80%;
    }
    .col-1-row-3{
        display: flex;
        justify-content: flex-end;
        margin-left: 85px;
        font-size: 28px;
    }
    .help{
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        opacity: 50%;
        bottom: 10%;
        position: absolute;
        left: 47%;
        pointer-events: none;
        display:none;
    }
    @media(min-width: 1000px){
        .help{
            display: block;
        }
    }
    #wordsInput{
        opacity: 0;
        padding: 0px;
        margin: 0px;
        border: none;
        outline: none;
        display: block;
        resize: none;
        position: fixed;
        cursor: default;
        width: 60%;
        height: 15%;
    }
    .wordsmith-dashboard{
        display:flex;
        flex-wrap: wrap;
    }
    @media(max-width:768px){
        .focus-mode-row{
            min-width: 95px;
            margin-left: -45px;
        }
    }
    .wordsmith-timer{
        text-align: center;
        font-size:30px;
        opacity: 60%;
    }
    `;

    private difficultyMap: Map<string, Difficulty> = new Map<string, Difficulty>([["easy", Difficulty.EASY], 
    ["medium", Difficulty.MEDIUM], ["hard", Difficulty.HARD], ["legend", Difficulty.LEGEND], 
    ["ultimate", Difficulty.ULTIMATE], ["expert", Difficulty.EXPERT], ["starter", Difficulty.STARTER]]);
    private validKeyMap: Map<string, boolean> = new Map<string, boolean>([["q", true], ["w", true], ["e", true], 
    ["r", true], ["t", true], ["y", true], ["u", true], ["i", true], ["o", true], ["p", true], ["a", true], ["s", true], 
    ["d", true], ["f", true], ["g", true], ["h", true], ["j", true], ["k", true], ["l", true], ["z", true], ["x", true], 
    ["c", true], ["v", true], ["b", true], ["n", true], ["m", true], ["Q", true], ["W", true], ["E", true], ["R", true], 
    ["T", true], ["Y", true], ["U", true], ["I", true], ["O", true], ["P", true], ["A", true], ["S", true], ["D", true], 
    ["F", true], ["G", true], ["H", true], ["J", true], ["K", true], ["L", true], ["Z", true], ["X", true], ["C", true], 
    ["V", true], ["B", true], ["N", true], ["M", true], ["[", true], ["]", true], [";", true], ["'", true], [",", true], 
    ["?", true], ["!", true], ["&", true], ["*", true], ["(", true], [")", true], ["-", true], ["%", true], ["#", true],  
    ["Tab", true], ["Enter", true], ["Backspace", true], [" ", true], [".", true]]);
    private prevInput: string = "";
    private defaultBookTitle: string = "The Alchemist";
    private interval: NodeJS.Timer = {} as NodeJS.Timer;

    firstUpdated() {
        this.nextStage();
        this.addEventListeners();
    }

    protected updated(_changedProperties: Map<string | number | symbol, unknown>): void {
        if(!_changedProperties.has("totalWordsCorrect") && !_changedProperties.has("totalWordsIncorrect")){
            if (this.pause){
                this.totalWordsCorrect += this.currentStage.wordsCorrect;
                this.totalWordsIncorrect += this.currentStage.wordsIncorrect;
            }
        }       

    }

    constructor(book: Book) {
        super();
        this.book = book || this.getDefaultBook();
    }

    private addEventListeners(){
        const keyEvent = isMobile() ? "keyup" : "keydown";
        document.addEventListener(keyEvent, (event: Event) => {
            let keyboardEvent = event as KeyboardEvent;
            if(keyboardEvent.key == "Unidentified"){ return; }
            this.handleKeyboardEvent(keyboardEvent);
        });
        if(!isMobile() || this.iOS()){ return; }
        document.addEventListener("input", (event:any)=>{
            this.handleInput(event.data);
        });
    }

    private iOS(){
        return navigator.userAgent.includes('iPhone');
    }
    
    private handleKeyboardEvent(e:KeyboardEvent){
        if (!this.validKeyMap.get(e.key)){ return; }
        if (e.key == "Tab") {
            e.preventDefault();
        }
        this.updateUserInput(e.key);
    }
    private handleInput(input: string){
        if(this.trackEnded){ return; }
        if(input == null || input.length == 0 && this.prevInput.length == 0 || input.length < this.prevInput.length){
            this.prevInput = input || '';
            this.updateUserInput("Backspace");
            return;
        }
        this.prevInput = input || '';
        input = input.replace(' ', '');
        let key = input.length > 0 ? input.substring(input.length-1) : '';
        this.updateUserInput(key);
    }

    private updateUserInput(input:string){
        if (input == "Tab"){
            if (this.pause || this.trackEnded ) { return; }
            if (this.userAnswerMap.size > 0) {
                this.pause = !this.pause;
                this.currentStage.wordsIncorrect = this.currentStage.pendingQuestionCount;
                this.activeQuestionIndex = this.currentStage.totalQuestionCount;
            }
            this.submitAnswer();
            return;
        }
        if (input == "Backspace") {
            if (this.pause || this.trackEnded ) { return; }
            let activeQuestionInput = this.userAnswerMap.get(this.activeQuestionIndex) || '';
            if(activeQuestionInput.length <= 0){
                if (this.activeQuestionIndex > 0) { this.activeQuestionIndex--; }
                return;
            }
            activeQuestionInput = activeQuestionInput.substring(0, activeQuestionInput.length - 1);
            if (!this.updateUserAnswerMap(activeQuestionInput, this.activeQuestionIndex)) {
                console.log("User answer map update failed.");
            }
            return;
        }
        if(input == "Enter"){
            if(this.trackEnded){
                this.resetWordsmith();
                return;
            }
            if (this.currentStage.pendingQuestionCount > 0) {
                this.activeQuestionIndex++;
                return;
            }
            if(this.currentStage.pendingQuestionCount == 0){
                if (this.userAnswerMap.size > 0) {
                    this.pause = !this.pause;
                    this.activeQuestionIndex++;
                }
                this.submitAnswer();
            }
            return;
        }
        if(this.pause){ return; }
        if (input == " ") {
            if (this.currentStage.pendingQuestionCount > 0) {
                this.activeQuestionIndex++;
            }
            return;
        }
        if(this.trackEnded){ return; }
        if (this.userAnswerMap.get(this.activeQuestionIndex) === undefined) {
            this.userAnswerMap.set(this.activeQuestionIndex, "");
        }
        let activeQuestionInput = this.userAnswerMap.get(this.activeQuestionIndex) + input;
        if (!this.updateUserAnswerMap(activeQuestionInput, this.activeQuestionIndex)) {
            console.log("User answer map update failed.");
        }
    }

    private updateUserAnswerMap(questionInput: string, elementIndex: number) {
        let updatedAnswerMap = new Map<number, string>();
        for (const key of this.userAnswerMap.keys()) {
            updatedAnswerMap.set(key, this.userAnswerMap.get(key) || '');
        }
        updatedAnswerMap.set(elementIndex, questionInput);
        this.userAnswerMap = updatedAnswerMap;
        return true;
    }

    private truncateUserInput(inputLength: number, userInput: string) {
        let input = userInput;
        if (inputLength < input.length) {
            input = input.substring(0, inputLength);
        }
        return input;
    }
    private submitAnswer() {
        let isStageCorrect = null;
        this.currentStage.timeEnd = new Date();
        if (this.userAnswerMap.size > 0) {
            isStageCorrect = this.currentStage.wordsIncorrect == 0;
        }
        if (this.pause) {
            this.updateTrackMessage(this.currentStage.name, isStageCorrect);
            return;
        }
        this.setStageResponseIsRight(this.currentStage.name, isStageCorrect);
        if(isStageCorrect === false && this.menuSelectionMap.get("focus-mode")?.get("focus")){
            this.endTrack();
            return;
        }                                                   
        this.nextStage(this.round);
    }

    private isUserAnswerCorrect(userAnswer: string, correctAnswer: string) {
        //check against expected result, removing special characters.
        return userAnswer.replace(/[^a-zA-Z ]/g, "").toLowerCase() == correctAnswer.replace(/[^a-zA-Z ]/g, "").toLowerCase();
    }

    private getDefaultBook() {
        this.books = getBooks();
        let book = this.books.find((el) => el.title == this.defaultBookTitle) || {} as Book;
        return book;
    }

    private getStagesFromBook(book: Book) {
        let splitBook = book.text.split(book.delimiter.toString());
        splitBook = splitBook.map((sentence) => {
            if (sentence[sentence.length - 1] != '.') {
                return sentence.concat('.');
            } else {
                return sentence;
            }
        });
        let cleanStages = splitBook.map((stage) => stage.replace(/\'+|(\n)+|^\s+|\s+$|\s{2,}|\“+|\”/g, '').trim());
        let stages = cleanStages.filter((sentence) => sentence.split(' ').length > 3);
        return stages;
    }

    private wordModeEnded(){
        return this.totalWordsCorrect + this.totalWordsIncorrect >= parseInt(this.getSelectedRadioMenuOptionBySection("word-count"));

    }

    private startTimeModeTimer(){
        this.trackTimer = parseInt(this.getSelectedRadioMenuOptionBySection("word-count"));
        this.interval = setInterval(()=>{
            this.trackTimer--;
            if (this.trackTimer <= 0){
                this.endTrack();
                clearInterval(this.interval);
            }
        }, 1000)
    }

    private menuMode(mode:string){
        return this.menuSelectionMap.get("word")?.get(mode);
    }

    private getSelectedRadioMenuOptionBySection(section:string){
        let keys = this.menuSelectionMap.get(section)?.keys();
        if (keys){
            for (const mapKey of keys){
                let selected = this.menuSelectionMap.get(section)?.get(mapKey);
                if (selected){
                    return mapKey;
                }
            }
        }
        return "";
    }

    private nextStage(round = 0) {
        if (!this.book) {
            return State.INVALID_BOOK;
        }
        if (round == 0) {
            this.stagesCompleted = 0;
            this.totalWordsCorrect = 0;
            this.totalWordsIncorrect = 0;
            this.currentStage.timeStart = new Date();
            let stages = this.getStagesFromBook(this.book);
            let trackDifficulty = this.getTrackDifficulty();
            if (this.menuMode("timed")) { this.startTimeModeTimer(); }
            let random =  this.menuSelectionMap.get("sequence")?.get("random");
            this.loadStages(this.book.title.toString(), stages, this.difficultyMap.get(trackDifficulty), random);
        }
        if (this.menuMode("words") && this.wordModeEnded()){
            this.endTrack();
            return State.FINISHED;
        }
        this.userAnswerMap = new Map<number, string>();
        this.currentStage.name = this.stageInstance?.toString() || "";
        this.currentStage.stageDifficulty = this.getStageDifficulty(this.currentStage.name);
        this.currentStage.stageWords = this.getStageWordsFromStage(this.currentStage);
        this.currentStage.stageCount = this.getStageCount(this.currentStage.name);
        this.currentStage.description = this.getStageDescription(this.currentStage.name);
        this.activeQuestionIndex = 0;
        return State.READY;
    }

    private getTrackDifficulty() {
        let currentDifficulty = this.menuSelectionMap.get("difficulty");
        let trackDifficulty = "";
        if (currentDifficulty) {
            for (const key of currentDifficulty.keys()) {
                if (currentDifficulty.get(key)) {
                    trackDifficulty = key;
                }
            }
        }
        return trackDifficulty;
    }

    private getStageWordsFromStage(currentStage: WordsmithStage) {
        let hiddenWordPercentage = 0;
        switch (currentStage.stageDifficulty) {
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
        let hiddenWordCount = Math.ceil(words.length * hiddenWordPercentage);
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
        if (elementIndex < this.activeQuestionIndex) {
            return "hidden-word-done";
        } else if (elementIndex == this.activeQuestionIndex) {
            return "hidden-word-active";
        } else if (elementIndex > this.activeQuestionIndex) {
            return "hidden-word";
        }
        return "";
    }

    private getQuestionElementContent(elementIndex: number, word: StageWord) {
        let userInput = this.userAnswerMap.get(elementIndex) || '';
        let inputLength = word.value.length;
        let truncatedUserInput = this.truncateUserInput(inputLength, userInput);
        if (!this.updateUserAnswerMap(truncatedUserInput, elementIndex)) {
            console.log("getQuestionElementContent failed to update the user answer map.");
            return null;
        };
        let wordSpace = new Array(word.value.length - truncatedUserInput.length).fill('_').join('');
        this.currentStage.totalQuestionCount++;
        if (elementIndex < this.activeQuestionIndex) {
            let correct = this.isUserAnswerCorrect(truncatedUserInput, word.value);
            let questionInput = "";
            let inputId = correct ? "user-input-correct" : "user-input-incorrect";
            if (correct){
                this.currentStage.wordsCorrect++;
            } else {
                this.currentStage.wordsIncorrect++;
            }
            if (!this.pause) { questionInput = truncatedUserInput + wordSpace; } else { questionInput = word.value; }
            this.currentStage.finishedQuestionCount++;
            // input is done
            return html` <div class="user-input ${inputId}">${questionInput}</div>&nbsp`;
        } else if (elementIndex == this.activeQuestionIndex) {
            // input is active
            return html` <div class="user-input">${truncatedUserInput}<div id="cursor">|</div>${wordSpace}&nbsp</div>`;
        } else if (elementIndex > this.activeQuestionIndex) {
            this.currentStage.pendingQuestionCount++;
            // input is pending
            return html` <div class="user-input">${truncatedUserInput}${wordSpace}&nbsp</div>`;
        }
        return ``;
    }

    private selectRadioOption(e: Event, callback: Function | null = null) {
        let element = e.target as HTMLElement;
        let parent = element.parentElement as HTMLElement;
        let children = parent.children;
        let updatedMenuMap = new Map<string, Map<string, boolean>>();
        for (const key of this.menuSelectionMap.keys()) {
            updatedMenuMap.set(key, this.menuSelectionMap.get(key) || new Map<string, boolean>());
        }
        updatedMenuMap.get(parent.id)?.set(element.id, true);
        for (var i = 0; i < children.length; i++) {
            if (children[i].id != element.id) {
                updatedMenuMap.get(parent.id)?.set(children[i].id, false);
            }
        }
        this.menuSelectionMap = updatedMenuMap;
        if (callback) { callback(); }
    }

    private selectSingleOption(e: Event, callback: Function | null = null){
        let element = e.target as HTMLElement;
        let parent = element.parentElement as HTMLElement;
        let updatedMenuMap = new Map<string, Map<string, boolean>>();
        for (const key of this.menuSelectionMap.keys()) {
            updatedMenuMap.set(key, this.menuSelectionMap.get(key) || new Map<string, boolean>());
        }
        let selected = updatedMenuMap.get(parent.id)?.get(element.id);
        updatedMenuMap.get(parent.id)?.set(element.id, !selected);
        console.log(updatedMenuMap.get(parent.id));
        this.menuSelectionMap = updatedMenuMap;
        if (callback) { callback(); }
    }

    private getSelectedOption(parentId: string, childId: string) {
        if (!this.menuSelectionMap.get(parentId)?.get(childId)) {
            return "row-option";
        } else {
            return "row-option-selected";
        }
    }

    private getWidgetContents() {
        if (!this.pause) {
            return html`<img id="refresh-button" src="../../assets/refresh-4.svg" width="20" height="20" @click=${() => this.resetWordsmith()}></img>`
        } else {
            if (this.currentStage.wordsIncorrect > 0) {
                return html`<div class="stage-status">Incorrect...</div>
                <div class="track-message">${this.trackMessage}</div>`;
            } else {
                return html`Correct!<div>${this.trackMessage}</div>`;
            }
        }
    }

    private getAnsweredRightCount() {
        return this.trackStatus.answerRight;
    }
    private getAnsweredWrongCount() {
        return this.trackStatus.answerWrong;
    }

    private isProgressSelected() {
        return this.menuSelectionMap.get("progression")?.get("progress") || false;
    }

    private getWordAccuracy() {
        return Math.round((this.totalWordsCorrect / (this.totalWordsCorrect + this.totalWordsIncorrect)) * 100);
    }

    private resetWordsmith(){
        clearInterval(this.interval);
        this.resetTrack(() => this.nextStage());
        this.pause = false;
    }

    private handleInputFocus(focus: boolean){
        if(!isMobile() || this.iOS()){ return; }
        this.showMenu = !focus;
    }

    private triggerSubmit(){
        if(!isMobile()){ return; }
        let options: KeyboardEventInit = {key: "Enter"};
        let event = new KeyboardEvent("keyup", options);
        document.dispatchEvent(event);
    }

    render() {
        let hiddenWordIndex = 0;
        this.currentStage.wordsCorrect = 0;
        this.currentStage.wordsIncorrect = 0;
        this.currentStage.finishedQuestionCount = 0;
        this.currentStage.pendingQuestionCount = 0;
        this.currentStage.totalQuestionCount = 0;
        return html`
            <div class="wordsmith-main" style="${this.iOS() ? "max-height: 75vh;" : ""}">
                <div class="wordsmith-results-modal"  @click="${()=>{this.triggerSubmit()}}" 
                style="display:${this.trackEnded ? 'block' : 'none'}">
                    <div class="result-title">Track Ended</div>
                    <div class="options-array">${Array.from(this.menuSelectionMap, ([key, value])=>{
                        for(const entry of value.keys()){
                            if(value.get(entry)){
                                return html`${entry}&nbsp`
                            }
                        }
                    })}</div>
                    <div class="results">
                        <div class="result-col-1">
                            <div class="col-1-row-1">
                                <div class="col-1-row-1-col-1">stages ${isMobile() ? "" : "completed"}</div>
                                <div class="col-1-row-1-col-2">${this.stagesCompleted}</div>
                            </div>
                            <div class="col-1-row-2">
                                <div class="col-1-row-2-col-1">words ${isMobile() ? "" : "found"}</div>
                                <div class="col-1-row-2-col-2">accuracy</div>
                            </div>
                            <div class="col-1-row-3" id="words-col">
                                <div class="col-1-row-3-col-1" style="margin-right:70px">${this.totalWordsCorrect}</div>
                                <div class="col-1-row-3-col-2">${this.getWordAccuracy()}%</div>
                            </div>
                        </div>
                        <div class="result-col-2">
                            <div class="col-1-row-1" style="justify-content:start">
                                <div class="col-1-row-1-col-1">time ${isMobile() ? "" : "completed"}</div>
                                <div class="col-1-row-1-col-2">${this.trackDuration}</div>
                            </div>
                            <div class="col-1-row-2" style="justify-content:start">
                                <div class="col-1-row-2-col-1">book title</div>
                            </div>
                            <div class="col-1-row-3" style="margin-left:0; justify-content:start">
                                <div class="col-1-row-3-col-1">${this.book.title}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="wordsmith-track" style="display:${this.trackEnded ? 'none' : 'block'}">
                <input
                    id="wordsInput"
                    tabindex="0"
                    type="text"
                    autocomplete="off"
                    autocapitalize="off"
                    autocorrect="off"
                    @click="${()=>this.handleInputFocus(true)}"
                    @blur="${()=>this.handleInputFocus(false)}"
                />
                ${this.menuMode("timed") ? html`<div class="wordsmith-timer">${this.trackTimer}</div>` : ``}
                <div class="wordsmith-text-area ${this.showMenu ? "" : "mobile-keyboard"}">
                        ${this.currentStage.stageWords ? this.currentStage.stageWords.map((word) => {
                if (word.visible) {
                    return html`<div class="word">${word.value}&nbsp</div>`;
                } else {
                    let currentIndex = hiddenWordIndex;
                    hiddenWordIndex++;
                    return html`<div class="${this.getQuestionElementClassName(currentIndex)}">${this.getQuestionElementContent(currentIndex, word)}</div>`;
                }
            }) : ''}
                    </div>
                    <div class="wordsmith-widget">${this.getWidgetContents()}</div>
                    ${this.showMenu ? html`
                    <div class="wordsmith-menu-options">
                        <div class="focus-mode-row menu-row" id="focus-mode">
                            <div class="focus-option ${this.getSelectedOption("focus-mode", "focus")}" id="focus"  @click="${(e: Event) => this.selectSingleOption(e, () => this.resetWordsmith())}">Focus Mode</div>
                        </div>
                        <div class="word-time-row menu-row" id="word">
                            <div class="words-option ${this.getSelectedOption("word", "words")}" id="words"  @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">Words</div>
                            <div class="timed-option ${this.getSelectedOption("word", "timed")}" id="timed"  @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">Timed</div>
                        </div>
                        <div class="word-count-row menu-row" id="word-count">
                            <div class="words-option ${this.getSelectedOption("word-count", "10")}" id="10"  @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">10</div>
                            <div class="words-option ${this.getSelectedOption("word-count", "20")}" id="20"  @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">20</div>
                            <div class="words-option ${this.getSelectedOption("word-count", "30")}" id="30"  @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">30</div>
                            <div class="words-option ${this.getSelectedOption("word-count", "60")}" id="60"  @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">60</div>
                            <div class="words-option ${this.getSelectedOption("word-count", "90")}" id="90"  @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">90</div>
                        </div>
                        <div class="sequence-row menu-row" id="sequence">
                            <div class="sequential-option ${this.getSelectedOption("sequence", "sequential")}" id="sequential"  @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">Sequential</div>
                            <div class="random-option ${this.getSelectedOption("sequence", "random")}" id="random"  @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">Random</div>
                        </div>
                        <div class="difficulty-row menu-row" id="difficulty">
                            <div class="easy-option ${this.getSelectedOption("difficulty", "easy")}" id="easy" @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">Easy</div>
                            <div class="medium-option ${this.getSelectedOption("difficulty", "medium")}" id="medium" @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">Medium</div>
                            <div class="hard-option ${this.getSelectedOption("difficulty", "hard")}" id="hard" @click="${(e: Event) => this.selectRadioOption(e, () => this.resetWordsmith())}">Hard</div>
                        </div>
                        <div class="progress-row menu-row" id="progression">
                            <div class="progress-option ${this.getSelectedOption("progression", "progress")}" id="progress" style="display:block;" @click="${(e: Event) => this.selectSingleOption(e)}">Progress</div>
                        </div>
                        <div class="count-row menu-row" id="count">
                            <div class="answered-right-count row-option-static" id="correct" .hidden="${!this.isProgressSelected()}">Correct: ${this.getAnsweredRightCount()}</div>
                            <div class="answered-wrong-count row-option-static" id="incorrect" .hidden="${!this.isProgressSelected()}">Incorrect: ${this.getAnsweredWrongCount()}</div>
                        </div>
                    </div>` : ""}
                    <div class="help">press tab to skip</div>
                </div>
            </div>
        `;
    }
}

customElements.define('wordsmith-game', Wordsmith);