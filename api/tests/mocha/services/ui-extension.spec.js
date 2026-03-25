const sinon = require('sinon');
const chai = require('chai');
const service = require('../../../src/services/ui-extension');
const db = require('../../../src/db');

describe('UI Extension service', () => {
  let dbGet;
  let allDocs;

  beforeEach(() => {
    dbGet = sinon.stub(db.medic, 'get');
    allDocs = sinon.stub(db.medic, 'allDocs');
  });

  afterEach(() => sinon.restore());

  describe('getScript', () => {
    it('handles undefined doc', async () => {
      dbGet.resolves(undefined);
      const actual = await service.getScript('test');
      chai.expect(actual).to.be.undefined;
    });

    it('handles 404', async () => {
      dbGet.rejects({ status: 404 });
      const actual = await service.getScript('test');
      chai.expect(actual).to.be.undefined;
    });

    it('throws anything else', async () => {
      dbGet.rejects({ status: 500 });
      try {
        await service.getScript('test');
        chai.expect.fail('should have thrown');
      } catch (e) {
        chai.expect(e.status).to.equal(500);
      }
    });

    it('returns attachment data', async () => {
      dbGet.resolves({
        _attachments: {
          'extension.js': { data: 'my-script' }
        }
      });
      const actual = await service.getScript('test');
      chai.expect(actual.data).to.equal('my-script');
    });
  });

  describe('getAllProperties', () => {
    it('removes CouchDB fields and maps id', async () => {
      allDocs.resolves({
        rows: [
          {
            doc: {
              _id: 'ui-extension:my-ext',
              _rev: '1-something',
              _attachments: {},
              name: 'My Extension',
              version: '1.0'
            }
          }
        ]
      });

      const actual = await service.getAllProperties();
      chai.expect(actual.length).to.equal(1);
      chai.expect(actual[0]).to.deep.equal({
        id: 'my-ext',
        name: 'My Extension',
        version: '1.0'
      });
    });
  });
});
