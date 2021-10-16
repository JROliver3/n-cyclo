import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class NCyclo extends LitElement {
  @property({ type: String }) title = 'My app';

  static styles = css`
  .main{
    display:flex;
    align-items: center;
    height: 100vh;
    background: white;
  }
  .selection-main{
    display: flex;
    padding: 10px;
    border: 2px solid;
    border-radius: 10px;
    width: 80%;
    margin: 0 auto;
  }
  .selection-item{
    width: 300px;
    height: 500px;
    border: 2px solid;
    border-radius: 10px;
    padding: 20px;
    margin: 20px;
  }
  `;

  render() {
    return html`
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" 
    integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">

    <div class="main">
      <div class="selection-main">
        <div class="selection-item selection-words">words</div>
        <div class="selection-item selection-numbers">numbers</div>
        <div class="selection-item selection-sudoku">sudoku</div>
        <div class="selection-item selection-chess">chess</div>
      </div>
      </div>
    `;
  }
}
