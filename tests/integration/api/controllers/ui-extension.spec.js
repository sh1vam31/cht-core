const chai = require('chai');
const utils = require('@utils');

describe('UI Extension', () => {

  describe('GET /ui-extension', () => {
    it('returns 200 with list of extensions', async () => {
      // Create a test doc
      await utils.saveDoc({
        _id: 'ui-extension:integration-test-ext',
        name: 'Integration Test Extension',
        version: '1.0'
      });
      
      const response = await utils.request({ path: '/ui-extension' });
      const created = response.find(ext => ext.id === 'integration-test-ext');
      chai.expect(created).to.not.be.undefined;
      chai.expect(created.name).to.equal('Integration Test Extension');
    });
  });

  describe('GET /ui-extension/:name', () => {
    it('returns 404 for unknown extension', async () => {
      await utils.request({ path: '/ui-extension/unknown-ext' })
        .then(() => chai.expect.fail('should have thrown'))
        .catch(err => chai.expect(err.status).to.equal(404));
    });

    it('returns 200 and script data for known extension', async () => {
      const scriptContent = 'console.log("integration-test-ext");';
      await utils.saveDoc({
        _id: 'ui-extension:integration-test-ext-script',
        _attachments: {
          'extension.js': {
            content_type: 'application/javascript',
            data: Buffer.from(scriptContent).toString('base64')
          }
        }
      });
      
      const response = await utils.request({
        path: '/ui-extension/integration-test-ext-script',
        headers: { Accept: 'application/javascript' }
      });
      chai.expect(response).to.equal(scriptContent);
    });
  });

});
