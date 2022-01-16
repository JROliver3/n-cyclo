import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ncycloStyles } from './styles.css';

import './track-selection';
import './wordsmith/wordsmith';
import './login/login';

export class NCyclo extends LitElement {
  @property({ type: String }) route = "game";
  @property({ type: String }) test = "";
  @property({ type: Object }) params = {};
  @property({ type: Object }) data = {};
  @property({ type: Object }) query = {};

  static get properties() {
    return {
      route: { type: String },
      params: { type: Object },
      query: { type: Object },
      data: { type: Object }
    };
  }

  static styles = ncycloStyles;

  static get routes() {
    return [
      {
        name: "home",
        pattern: "",
        data: { title: "Home" }
      },
      {
        name: "info",
        pattern: "info"
      },
      {
        name: "game",
        pattern: "game/:id"
      },
      {
        name: "not-found",
        pattern: "*"
      }
    ];
  }

  private showComponent(name:String){
    return this.route === name;
  }

  private setRoute(name:String){
    console.log(window.location.href);
    this.route = name.toString();
  }

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
          <a href="#"><div class="nav-button">Home</div></a>
          <a href="#"><div class="nav-button">Stats</div></a>
          <a href="#"><div class="nav-button">Games</div></a>
          <a href="#"><div class="nav-button">About</div></a>
        </div>
        <div class="nav-sec nav-right">
          <a href="login" class="profile-button" @click="${()=>{this.setRoute("login")}}">Login</a>
        </div>
      </div>
    </div>
    <div class="main">
      ${this.showComponent("main") ?
      html`<div class="selection-main">
        <div class="main__title"><h3>Current Tracks</h3></div>
        <button class="new-item-button">Start New Track</button>
        <div class="selection-items">
          <track-selection ></track-selection>
        </div>
      </div>` : ``}
      <wordsmith-game .hidden="${!this.showComponent("game")}" style="flex-grow:1"></wordsmith-game>
      ${this.showComponent("login") ? html`<user-login></user-login>` : ""}
    </div>
    `;
  }
}

























