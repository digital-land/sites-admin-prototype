//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

router.all('*', (req, res, next) => {
  let now = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })
  let data = JSON.stringify(req.session.data, null, 2)
  console.log(`${now} ${req.url}\nsessiondata: ${data}\n\n`)
  next()
})

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

router.all('/iteration-01/review-form', (req, res, next) => {
  // create a session variable to indicate that the form has been created when entering this page
  req.session.data['formCreated'] = "true"

  let locals = {}
  if (req.session.data['unpublishForm'] === 'Yes') {
      // reset unpublished form data
    req.session.data['unpublishForm'] = null
    req.session.data['formPublished'] = "false"
    req.session.data['formPublishedDate'] = null
    // set local data that persist for a single page view
    locals.displayBanner = true
    locals.bannerMessage = "Form unpublished"
  }

  res.render('iteration-01/review-form', locals)
})

router.all('/iteration-01/published-form', (req, res, next) => {
  // create a session variable to indicate that the form has been published when entering this page
  req.session.data['formPublished'] = "true"

  next()
})
