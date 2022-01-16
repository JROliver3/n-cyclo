import { LitElement, html, property, css } from 'lit-element';
import { navigator } from 'lit-element-router';

class Link extends navigator(LitElement) {
    @property({ type: String }) href = '';

    static styles = css`
    a, a:hover, a:focus, a:visited{
        text-decoration: none; 
       }
       a{
       color:#000000;
       opacity: 80%;
       }
       a:hover{
       color: #000000;
       opacity: 100%;
       text-decoration: none;
       }
       a:focus{
       text-decoration: none;
       opacity: 100%;
       color:#000000
       }`;

    constructor() {
        super();
        this.href = '';
    }
    render() {
        return html`
            <a href='${this.href}' @click='${this.linkClick}'>
                <slot></slot>
            </a>
        `;
    }
    linkClick(event: Event) {
        event.preventDefault();
        this.navigate(this.href);
    }
}
 
customElements.define('app-link', Link);