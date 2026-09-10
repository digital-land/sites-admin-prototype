//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

/**********************************************************
 * First time user journey
**********************************************************/

router.post('/iteration-01/constraints-question-controller', (req, res, next) => {
  if (req.session.data['addQuestion'] === 'Yes') {
    return res.redirect('/iteration-01/enter-question')
  } else {
    return res.redirect('/iteration-01/review-form')
  }
})

router.post('/dashboard-published-form', (req, res) => {
  req.session.data.formCreated = true
  res.redirect('/dashboard-published-form')
})


