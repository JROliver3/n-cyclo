import 'jasmine';

import {Wordsmith} from './wordsmith';

describe("wordsmith test", () =>{
    let wordsmithComponent: Wordsmith;

    beforeEach(async () => {
        wordsmithComponent = new Wordsmith();
        document.body.appendChild(wordsmithComponent);
        await wordsmithComponent.updateComplete;
    });
});