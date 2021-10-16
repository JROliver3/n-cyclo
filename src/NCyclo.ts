import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

export class NCyclo extends LitElement {
  @property({ type: String }) title = 'My app';

  static styles = css``;

  render() {
    return html`
    `;
  }
}
