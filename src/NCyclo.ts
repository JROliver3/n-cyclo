import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ncycloStyles } from './styles.css';
import { router } from 'lit-element-router';

import './track-selection';
import './wordsmith/wordsmith';
import './login/login';
import './main';
import './link';

const {firebase, firebaseui } = window as any;

export class NCyclo extends router(LitElement) {
  @property({ type: String }) route = "games";
  @property({ type: String }) test = "";
  @property({ type: Object }) params = {};
  @property({ type: Object }) data = {};
  @property({ type: Object }) query = {};

  constructor() {
    super();
    this.signin();
  }
  
  async signin() {
    await this.updateComplete;    
    // FirebaseUI config.
    const uiConfig = {
      signInSuccessUrl: '/',
      signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
      ],
      // tosUrl and privacyPolicyUrl accept either url string or a callback
      // function.
      // Terms of service url/callback.
      tosUrl: '/',
      // Privacy policy url/callback.
      privacyPolicyUrl: function() {
      window.location.assign('/');
      }
    };

    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    const container = this.shadowRoot?.getElementById('firebaseui-container');
    ui.start(container, uiConfig);
  }

  signout() { firebase.auth.signout(); }

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
        name: "games",
        pattern: "games"
      },
      {
        name: "login",
        pattern: "login"
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

  router(route:string, params:Object, query:Object, data:Object){
    this.route = route;
    this.params = params;
    this.query = query;

  }

  //TODO: render tracks from user's current running tracks.
  render() {
    return html`
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" 
    integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">
    <script src="https://www.gstatic.com/firebasejs/ui/6.0.0/firebase-ui-auth.js"></script>
    <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.0.0/firebase-ui-auth.css" />
    <div class="nav">
      <div class="nav-body">
        <div class="nav-sec nav-left">
          <div class="logo">NCyclo</div>
          <app-link href="/"><div class="nav-button" >Home</div></app-link>
          <app-link href="stats"><div class="nav-button">Stats</div></app-link>
          <app-link href="games"><div class="nav-button">Games</div></app-link>
          <app-link href="about"><div class="nav-button">About</div></app-link>
        </div>
        <div class="nav-sec nav-right">
          <app-link href="login" class="profile-button">Login</app-link>
        </div>
      </div>
    </div>
    <app-main class="main" active-route=${this.route}>
      <div class="selection-main" route="games">
        <div class="main__title"><h3>Current Tracks</h3></div>
        <button class="new-item-button">Start New Track</button>
        <div class="selection-items">
          <track-selection ></track-selection>
        </div>
      </div>
      <div class="app-wordsmith" route="home">
        <wordsmith-game style="flex-grow:1"></wordsmith-game>
      </div>
      <div class="app-login" route="login">
      <div id="firebaseui-container" route="login"></div>
      </div>
  </app-main>
    `;
  }
}

























