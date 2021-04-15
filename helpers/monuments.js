const monuments = require('../monuments.json');
const monumentsTranslated = require('../monuments-translated.json');

// monuments + monument string name
const translateMonument = (monName) => monumentsTranslated[monName];
const hasMonumentString = (list, monumentName) => {
  if (monumentName === undefined) return '-';
  return list.includes(monumentName)
    ? `✅ ${translateMonument(monumentName)}`
    : `❌ ${translateMonument(monumentName)}`;
}

module.exports = {
  monuments,
  hasMonumentString
}
