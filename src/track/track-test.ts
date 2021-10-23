import 'jasmine';

import {Track} from './track';

describe("wordsmith test", () =>{
    let track: Track;

    beforeEach(async () => {
        track = new Track();
        document.body.appendChild(track);
        await track.updateComplete;
    });

    it("can get stage distribution", () => {
    })

});