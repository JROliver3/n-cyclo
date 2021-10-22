import { LitElement, html, css, property } from 'lit-element';
import { navigator } from 'lit-element-router';

import { Track } from '../track/track';

/** 
* The wordsmith component works by creating stage instances and using a probability
* distribution to determine which stage type should appear in each stage instance. 
*
* The component serves the game to the user. The inputs are the user's guesses to each challenge/stage, and the output is an
* object representing the metrics of the performance on each stage. The output will be used by any parent components in order
* to track user progression.
*/

export class Wordsmith extends Track {
    @property({type: String}) book = '';
    @property({type: Object}) currentStage = {};

    static styles = css`
    .wordsmith-main {
        display: flex;
    }`;

    private selectBook(bookId: String){

    }

    render() {
        return html`
            <div class="wordsmith-main">
                <div class="wordsmith-text-area">
                    ${this.stageInstance}
                </div>
            </div>
        `;
    }
}
 
customElements.define('wordsmith-game', Wordsmith);