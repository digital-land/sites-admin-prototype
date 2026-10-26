//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

require('dotenv').config({ quiet: true })

const govukPrototypeKit = require('govuk-prototype-kit')
const { randomUUID } = require('node:crypto')
const { createSubmissions, createBoundary, sections: submissionSections } = require('./data/submissions')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

router.use('/iteration-01', (req, res, next) => {
  // Resolve simulated jobs on the next request, even if the user left the processing page.
  for (const download of Object.values(req.session.data.submissionDownloads)) {
    if (!download.complete && Date.now() >= download.readyAt) {
      for (const submission of req.session.data.submissions) {
        if (download.references.includes(submission.reference)) submission.downloaded = true
      }
      download.complete = true
    }
  }
  res.locals.newSubmissionCount = req.session.data.submissions.filter(submission => !submission.downloaded).length
  next()
})

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

router.get('/iteration-01/submissions-scenario', (req, res) => {
  req.session.data.submissions = createSubmissions()
  req.session.data.submissionDownloads = {}
  req.session.data.formCreated = 'true'
  req.session.data.formPublished = 'true'
  res.redirect('/iteration-01/dashboard')
})

router.get(['/iteration-01/site-submissions', '/iteration-01/downloaded-sites'], (req, res) => {
  const downloaded = req.path === '/iteration-01/downloaded-sites'
  res.render('iteration-01/site-submissions', {
    downloaded,
    submissions: req.session.data.submissions.filter(submission => submission.downloaded === downloaded)
  })
})

router.get('/iteration-01/view-submission/:reference', (req, res) => {
  const submission = req.session.data.submissions.find(submission => submission.reference === req.params.reference)
  if (!submission) {
    return res.status(404).send('Submission not found. Return to View site submissions to select a submission.')
  }
  res.render('iteration-01/view-submission', {
    submission,
    submissionSections,
    boundary: createBoundary(submission.reference),
    osMapsApiKey: process.env.ORDNANCE_SURVEY_API_KEY,
    returnUrl: submission.downloaded ? '/iteration-01/downloaded-sites' : '/iteration-01/site-submissions'
  })
})

router.get('/iteration-01/submission-boundary/:reference', (req, res) => {
  const submission = req.session.data.submissions.find(submission => submission.reference === req.params.reference)
  const boundary = submission && createBoundary(submission.reference)
  if (!boundary) {
    return res.status(404).send('Submission boundary not found.')
  }
  res.json({ type: 'FeatureCollection', features: [boundary] })
})

router.get('/iteration-01/view-submission', (req, res) => {
  const submission = req.session.data.submissions[0]
  res.redirect(submission ? '/iteration-01/view-submission/' + submission.reference : '/iteration-01/site-submissions')
})

router.get('/iteration-01/download-submissions/:scope/:format', (req, res) => {
  const { scope, format } = req.params
  if (!['new', 'all'].includes(scope) || !['csv', 'geojson'].includes(format)) {
    return res.status(404).send('Download option not found. Choose CSV or GeoJSON from View site submissions.')
  }
  const selected = req.session.data.submissions.filter(submission => scope === 'all' || !submission.downloaded)
  if (!selected.length) {
    return res.redirect(scope === 'new' ? '/iteration-01/site-submissions' : '/iteration-01/downloaded-sites')
  }

  const id = randomUUID()
  req.session.data.submissionDownloads[id] = {
    scope,
    format: format === 'csv' ? 'CSV' : 'GeoJSON',
    references: selected.map(submission => submission.reference),
    readyAt: Date.now() + 2000,
    complete: false
  }
  res.redirect('/iteration-01/submission-download/' + id)
})

router.get('/iteration-01/submission-download/:id', (req, res) => {
  const download = req.session.data.submissionDownloads[req.params.id]
  if (!download) {
    return res.status(404).send('Download not found. Return to View site submissions to start a download.')
  }
  res.set('Cache-Control', 'no-store')
  res.render('iteration-01/submission-download', {
    download,
    returnUrl: download.scope === 'new' ? '/iteration-01/site-submissions' : '/iteration-01/downloaded-sites'
  })
})
