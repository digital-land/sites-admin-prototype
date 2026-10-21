//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const { randomUUID } = require('node:crypto')
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

router.get('/iteration-01/manage-editors', (req, res) => {
  const teamMemberAdded = req.session.data.teamMemberAdded
  const teamMemberMessage = req.session.data.teamMemberMessage
  delete req.session.data.teamMemberAdded
  delete req.session.data.teamMemberMessage

  for (const member of req.session.data.teamMembers) {
    if (!member.id) member.id = randomUUID()
  }

  res.render('iteration-01/manage-editors', { teamMemberAdded, teamMemberMessage })
})

router.post('/iteration-01/invite-new-editor', (req, res) => {
  req.session.data.teamMembers.push({
    id: randomUUID(),
    email: req.body.emailAddress,
    role: req.body.accessLevel
  })
  req.session.data.teamMemberAdded = true
  delete req.session.data.emailAddress
  delete req.session.data.accessLevel

  res.redirect('/iteration-01/manage-editors')
})

router.get('/iteration-01/manage-editors-invited', (req, res) => {
  res.redirect('/iteration-01/manage-editors')
})

router.all('/iteration-01/change-team-member/:id', (req, res, next) => {
  const member = req.session.data.teamMembers.find(member => member.id === req.params.id)
  if (!member) {
    return res.status(404).send('Team member not found. Return to Manage access to select a team member.')
  }

  res.locals.member = member
  next()
})

router.get('/iteration-01/change-team-member/:id', (req, res) => {
  res.render('iteration-01/change-team-member')
})

router.post('/iteration-01/change-team-member/:id', (req, res) => {
  if (req.body.updatedAccessLevel === 'remove') {
    req.session.data.teamMembers = req.session.data.teamMembers.filter(member => member.id !== req.params.id)
    req.session.data.teamMemberMessage = 'Team member removed'
  } else {
    res.locals.member.role = req.body.updatedAccessLevel
    req.session.data.teamMemberMessage = 'Team member access updated'
  }
  delete req.session.data.updatedAccessLevel

  res.redirect('/iteration-01/manage-editors')
})
