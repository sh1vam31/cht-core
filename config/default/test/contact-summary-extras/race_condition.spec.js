const { expect } = require('chai');
const { isReadyForNewPregnancy, isActivePregnancy, isReadyForDelivery } = require('../../contact-summary-extras');

describe('Race condition tests (undefined contact)', () => {
  it('isReadyForNewPregnancy() should return false if contact is undefined', () => {
    expect(isReadyForNewPregnancy(undefined, [])).to.be.false;
  });

  it('isActivePregnancy() should return false if contact is undefined', () => {
    expect(isActivePregnancy(undefined, [], {})).to.be.false;
  });

  it('isReadyForDelivery() should return false if contact is undefined', () => {
    expect(isReadyForDelivery(undefined, [])).to.be.false;
  });
});
