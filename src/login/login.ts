import { LitElement, html } from "lit";
import { loginStyles } from './login.css';

export class Login extends LitElement {

    static styles = loginStyles;
    
    render() {
        return html`<div class="main">
        </div>`;
    }
}
customElements.define('user-login', Login);