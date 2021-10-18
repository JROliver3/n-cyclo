import { LitElement, html, css } from 'lit-element';
import { navigator } from 'lit-element-router';
 
class Track extends navigator(LitElement) {
    href: string;
    static styles = css`
  .selection-item{
    width: 250px;
    height: 350px;
    box-shadow: 0 0 4px #999;
    background-color: rgb(247 244 244);
    border-radius: 10px;
    margin: 20px;
    font-weight: 100;
    padding: 1px;
  }
  .section-item-image{
    width: 100%;
    height: 70%;
    background-image: url("../assets/18269307_303.jpg");
    border-radius: 10px 10px 0 0;
  }
  .section-item-description{
    display:flex;
    justify-content: start;
    margin: auto;
    padding: 5px;
    flex-wrap: wrap;
    font-size: 14px;
  }
  .item-title{
      font-size: 15px;
      font-weight: bold;
      padding: 2px;
      color: #535353
  }
  .start-button-container{
      display:flex;
      justify-content:end;
  }
  .start-button{
    border: none;
    cursor: pointer;
    width: 100px;
    height: 25px;
    background-color: transparent;
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  /* .start-button{
    padding: 10px;
    margin: auto;
  } */
  `;
    static get properties() {
        return {
            href: { type: String }
        };
    }
    constructor() {
        super();
        this.href = '';
    }
    render() {
        return html`
            <div class="selection-item selection-words">
                <div class="section-item-image"></div>
                <div class="section-item-description">
                    <div class="item-title">Wordsmith</div>
                    This track trains memorization of words while reading and listening to text. 
                </div>
                <div class="start-button-container">
                    <button class="start-button" @click='${this.handleClick}'>Start</button>
                </div>
            </div>
        `;
    }
    handleClick(event: Event) {
        this.navigate(this.href);
    }
}
 
customElements.define('track-selection', Track);