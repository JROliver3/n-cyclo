import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class NCyclo extends LitElement {
  @property({ type: String }) title = 'My app';

  static styles = css`
  .nav{
    display:flex;
    width: 100%;
    align-content: space-between;
    justify-content: center;
    background-color: #000000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  .nav-body{
    display: flex;
    width:60%;
    padding:15px;
  }
  .nav-sec{
    width:100%;
    display:flex;
    color:white;
  }
  .nav-left{
    justify-content: start;
    align-items: center;
  }
  .nav-right{
    justify-content: end;
    align-items: center;
  }
  .logo{
    font-size: x-large;
    font-weight: bolder;
    margin-right: 10px;
  }
  .nav-button{
    font-weight: bolder;
    padding:10px;
    padding-top:13px;
  }
  .main{
    display:flex;
    align-items: center;
    height: 100vh;
    background: #f5f5f5;
  }
  .selection-main{
    display: flex;
    padding: 10px 20px;
    border-radius: 10px;
    box-shadow: 0 0 4px #eeeeee;
    max-width: 60%;
    margin: auto;
    align-items: center;
    flex-wrap: wrap;
    background-color: white;
    justify-content: space-between;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  .selection-items{
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    width: 100%;
  }
  .selection-item{
    width: 250px;
    height: 350px;
    box-shadow: 0 0 4px #999;
    background-color: rgb(247 244 244);
    border-radius: 10px;
    padding: 20px;
    margin: 20px;
    font-weight: 100;
  }
  .main__title{
    padding:12px;
  }
  button{
    background-color:#007dd1;
    width: 80px;
    height:30px;
    border-radius: 3px;
    border: 0;
    color: white;
  }
  .new-item-button{
    width: auto;
    height: auto;
    padding: 10px;
  }
  `;
  //TODO: render tracks from user's current running tracks.
  render() {
    return html`
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" 
    integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">
    <div class="nav">
      <div class="nav-body">
        <div class="nav-sec nav-left">
          <div class="logo">NCyclo</div>
          <div class="nav-button">Home</div>
          <div class="nav-button">Stats</div>
          <div class="nav-button">Games</div>
          <div class="nav-button">About</div>
        </div>
        <div class="nav-sec nav-right">
          <button class="profile-button">Login</button>
        </div>
      </div>
    </div>
    <div class="main">
      <div class="selection-main">
        <div class="main__title"><h3>Current Tracks</h3></div>
        <button class="new-item-button">Start New Track</button>
        <div class="selection-items">
          <div class="selection-item selection-words">Wordsmith</div>
        </div>
      </div>
      </div>
    `;
  }
}
