const sinon = require('sinon');
const chai = require('chai');
const controller = require('../../../src/controllers/ui-extension');
const service = require('../../../src/services/ui-extension');
const serverUtils = require('../../../src/server-utils');

let res;

describe('UI Extension controller', () => {
  beforeEach(() => {
    res = {
      json: sinon.stub(),
      set: sinon.stub(),
      send: sinon.stub(),
    };
  });

  afterEach(() => sinon.restore());

  describe('list', () => {
    it('returns JSON from service', async () => {
      sinon.stub(service, 'getAllProperties').resolves([{ id: 'test' }]);
      await controller.list({}, res);
      chai.expect(res.json.callCount).to.equal(1);
      chai.expect(res.json.args[0][0]).to.deep.equal([{ id: 'test' }]);
    });

    it('handles errors', async () => {
      sinon.stub(service, 'getAllProperties').rejects(new Error('boom'));
      const errorStub = sinon.stub(serverUtils, 'serverError');
      await controller.list({}, res);
      chai.expect(errorStub.callCount).to.equal(1);
    });
  });

  describe('get', () => {
    it('requires name param', async () => {
      const req = { params: {} };
      const errorStub = sinon.stub(serverUtils, 'error');
      await controller.get(req, res);
      chai.expect(errorStub.args[0][0].status).to.equal(400);
    });

    it('returns 404 when script not found', async () => {
      const req = { params: { name: 'test' } };
      sinon.stub(service, 'getScript').resolves(undefined);
      const errorStub = sinon.stub(serverUtils, 'error');
      await controller.get(req, res);
      chai.expect(errorStub.args[0][0].status).to.equal(404);
    });

    it('sends buffered script', async () => {
      const req = { params: { name: 'test' } };
      sinon.stub(service, 'getScript').resolves({ data: 'QUJD' }); // 'ABC' base64
      await controller.get(req, res);
      chai.expect(res.set.args[0]).to.deep.equal(['Content-Type', 'text/javascript']);
      chai.expect(res.send.args[0][0].toString()).to.equal('ABC');
    });
  });
});
