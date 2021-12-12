import { expect } from '@open-wc/testing';
import { Book } from '../books/books';
import { Wordsmith } from './wordsmith';
import { Difficulty } from '../enums/game';

describe("wordsmith test", () =>{
    let wordsmith: Wordsmith;

    beforeEach(async () => {
        let book = { title: "test-book", delimiter: ".", text: `Lorem ipsum dolor sit amet. consectetur adipiscing elit. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident. sunt in culpa qui officia deserunt mollit anim id est laborum.` } as Book;
        wordsmith = new Wordsmith(book);
        document.body.appendChild(wordsmith);
        await wordsmith.updateComplete;
    });
    

    it("can render question", ()=>{
        let textAreaElement = wordsmith.renderRoot?.querySelector('.wordsmith-text-area');
        let wordElements = wordsmith.renderRoot.querySelectorAll('.word');
        expect(textAreaElement?.innerHTML).to.not.be.empty;
        expect(wordElements.length).to.be.greaterThan(0);

    });
    it("creates a new track on load", ()=>{
        expect(wordsmith.trackStatus.name).to.be.not.empty;
        expect(wordsmith.trackStatus.name).to.equal("test-book");
    });
    it("creates stages for a new track on load", ()=>{
        expect(wordsmith.trackDifficulty).to.be.equal(Difficulty.EASY);
        expect(wordsmith.stages.length).to.be.equal(3);
        expect(wordsmith.stages[0].description).to.not.be.empty;
        expect(wordsmith.stages[1].description).to.not.be.empty;
        expect(wordsmith.stages[2].description).to.not.be.empty;
    });
    it("creates a new stage with starter difficulty", ()=>{
        expect(wordsmith.currentStage.name).to.not.be.empty;
        expect(wordsmith.currentStage.stageDifficulty).to.equal(Difficulty.STARTER);
    });
    it("distributes stages", ()=>{
        // buffer length should be one less than the stage load number
        // TODO: make the stage load number of property of the track.
        expect(wordsmith.stageBuffer.length == 9);
        let allStagesLoadedIntoBuffer = true;
        for(const stage of wordsmith.stages){
            if(!wordsmith.stageBuffer.includes(stage.name)){
                allStagesLoadedIntoBuffer = false;
                break;
            }
        }
        expect(allStagesLoadedIntoBuffer).to.be.true;
    });
    it("renders hidden questions", async ()=>{
        while(wordsmith.currentStage.stageDifficulty == 0){
            document.dispatchEvent(new KeyboardEvent("keypress", {key: 'Enter'}));
            await wordsmith.updateComplete;
        }
        let hiddenQuestions = wordsmith.renderRoot?.querySelectorAll('.hidden-word-active') || [];
        expect(hiddenQuestions?.length).to.be.greaterThan(0);

    });
    it("shows next stage when answer is submitted", async () => {
        while(wordsmith.currentStage.stageDifficulty == 0){
            document.dispatchEvent(new KeyboardEvent("keypress", {key: 'Enter'}));
            await wordsmith.updateComplete;
        }
        let prevStage = wordsmith.currentStage.name;
        let prevCount = wordsmith.currentStage.stageCount;
        let hiddenQuestions = wordsmith.renderRoot?.querySelectorAll('.hidden-word') || [];
        for(var i = 0; i < hiddenQuestions.length + 1; i++){
            document.dispatchEvent(new KeyboardEvent("keypress", {key: 'Enter'}));
        }
        expect(wordsmith.pause).to.be.true;
        document.dispatchEvent(new KeyboardEvent("keypress", {key: 'Enter'}));
        let currStage = wordsmith.currentStage.name;
        let currCount = wordsmith.currentStage.stageCount;
        expect(currStage).to.not.be.empty;
        if(currStage === prevStage){
            expect(currCount).to.not.be.equal(prevCount);
        }
    })
    it("refreshes on refresh button press", async ()=>{
        while(wordsmith.currentStage.stageDifficulty == 0){
            document.dispatchEvent(new KeyboardEvent("keypress", {key: 'Enter'}));
            await wordsmith.updateComplete;
        }
        expect(wordsmith.currentStage.stageDifficulty).to.be.equal(1);
        let refresh = wordsmith.renderRoot.querySelector('#refresh-button') as HTMLElement;
        refresh.click();
        await wordsmith.updateComplete;
        expect(wordsmith.round).to.be.equal(1);
        expect(wordsmith.currentStage.stageDifficulty).to.be.equal(0);
        let stagesAreReset = true;
        for(const stage of wordsmith.stages){
            if(stage.name == wordsmith.currentStage.name){ 
                stagesAreReset = stage.stageCount == 1;
                continue;
            } else if(stage.stageDifficulty > 0 || stage.stageCount > 1){
                stagesAreReset = false;
                break;
            }
        }
        expect(stagesAreReset).to.be.true;
    });
    it("has expected initial menu setup", ()=>{
        let map = wordsmith.menuSelectionMap;
        for(const selectionMap of map.values()){
            for(const selection of selectionMap.keys()){
                let element = wordsmith.renderRoot.querySelector(`#${selection}`);
                if(selectionMap.get(selection)){
                    expect(element?.classList[1]).to.be.equal("row-option-selected");
                } else {
                    expect(element?.classList[1] == "row-option");
                }
            }
        }
    });
    it("switches menu modes on press", async ()=>{
        let map = wordsmith.menuSelectionMap;
        for(const parent of map.keys()){
            let selectionMap = map.get(parent);
            if(!selectionMap){ continue; }
            for(const selection of selectionMap.keys()){
                let element = wordsmith.renderRoot.querySelector(`#${selection}`) as HTMLElement;
                element.click();
                await wordsmith.updateComplete;
                expect(element?.classList[1]).to.be.equal("row-option-selected");
                expect(wordsmith.menuSelectionMap.get(parent)?.get(selection)).to.be.true;
            }
        }
    });
    it("renders hidden word questions", async ()=>{
        while(wordsmith.currentStage.stageDifficulty == 0){
            document.dispatchEvent(new KeyboardEvent("keypress", {key: 'Enter'}));
            await wordsmith.updateComplete;
        }
        let hiddenQuestions = wordsmith.renderRoot?.querySelectorAll('.hidden-word-active') || [];
        expect(hiddenQuestions.length).to.be.greaterThan(0);
    });
    it("takes user input", async ()=>{
        while(wordsmith.currentStage.stageDifficulty == 0){
            document.dispatchEvent(new KeyboardEvent("keypress", {key: 'Enter'}));
            await wordsmith.updateComplete;
        }
        document.dispatchEvent(new KeyboardEvent("keypress", {key: 'f'}));
        await wordsmith.updateComplete;
        let hiddenQuestion = wordsmith.renderRoot?.querySelector('.hidden-word-active');
        expect(hiddenQuestion?.innerHTML).to.contain('f');
        expect(wordsmith.userAnswerMap.get(0)).to.equal('f');
    });
    it("renders right or wrong answers", async ()=>{
        while(wordsmith.currentStage.stageDifficulty == 0){
            document.dispatchEvent(new KeyboardEvent("keypress", {key: 'Enter'}));
            await wordsmith.updateComplete;
        }
        document.dispatchEvent(new KeyboardEvent("keypress", {key: 'f'}));
        await wordsmith.updateComplete;
        document.dispatchEvent(new KeyboardEvent("keypress", {key: 'Enter'}));
        await wordsmith.updateComplete;
        expect(wordsmith.currentStage.wordsIncorrect > 0).to.be.true;
        let userInputElement = wordsmith.renderRoot.querySelector('.user-input');
        expect(userInputElement?.classList[1]).to.be.equal("user-input-incorrect");
        document.dispatchEvent(new KeyboardEvent("keypress", {key: 'Backspace'}));
        await wordsmith.updateComplete;
        document.dispatchEvent(new KeyboardEvent("keypress", {key: 'Backspace'}));
        await wordsmith.updateComplete;
        let answerCorrect = false;
        for(const word of wordsmith.currentStage.description.split(' ')){
            if(word.length == userInputElement?.textContent?.length){
                wordsmith.userAnswerMap.set(0, word);
                wordsmith.requestUpdate();
                await wordsmith.updateComplete;
                if(wordsmith.currentStage.wordsIncorrect > 0){
                    wordsmith.userAnswerMap.set(0, "");
                    wordsmith.requestUpdate();
                    await wordsmith.updateComplete;
                    continue;
                } else {
                    answerCorrect = true;
                    break;
                }
            }
        }
        expect(answerCorrect).to.be.true;
        expect(userInputElement?.classList[1]).to.be.equal("user-input-correct");
    });
});