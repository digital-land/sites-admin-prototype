//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

// Add your filters here

addFilter('setAttribute', function(dictionary, key, value) {
  dictionary[key] = value;
  return dictionary;
});

addFilter('removeAttribute', function(dictionary, key) {
  dictionary[key] = null;
  return dictionary;
})