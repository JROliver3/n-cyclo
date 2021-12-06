import { fixture, expect } from '@open-wc/testing';

import { NCyclo } from '../src/NCyclo.js';
import '../src/n-cyclo.js';

describe('NCyclo', () => {
  let element: NCyclo;
  beforeEach(async () => {
    element = new NCyclo();
    document.body.appendChild(element);
    await element.updateComplete;  
  });

  it('renders a h1', () => {
    let hi = true;
    expect(hi).to.be.true;
  });
});
