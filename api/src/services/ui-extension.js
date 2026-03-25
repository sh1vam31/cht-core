const db = require('../db');

const PREFIX = 'ui-extension:';

const getExtensionDoc = (name) => {
  return db.medic.get(`${PREFIX}${name}`, { attachments: true })
    .catch(err => {
      if (err.status === 404) {
        return;
      }
      throw err;
    });
};

module.exports = {
  getScript: async (name) => {
    const doc = await getExtensionDoc(name);
    const attachment = doc && doc._attachments && doc._attachments['extension.js'];
    if (attachment) {
      return {
        data: attachment.data,
      };
    }
  },
  
  getAllProperties: async () => {
    const result = await db.medic.allDocs({
      startkey: PREFIX,
      endkey: `${PREFIX}\ufff0`,
      include_docs: true,
    });
    
    return result.rows.map(row => {
      const doc = row.doc;
      const id = doc._id.replace(PREFIX, '');
      
      // Remove CouchDB specific fields (starting with '_')
      const cleanProperties = Object.keys(doc)
        .filter(key => !key.startsWith('_'))
        .reduce((obj, key) => {
          obj[key] = doc[key];
          return obj;
        }, {});

      return {
        id,
        ...cleanProperties
      };
    });
  }
};
