//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

require('dotenv').config({ quiet: true })

const govukPrototypeKit = require('govuk-prototype-kit')
const { randomUUID } = require('node:crypto')
const https = require('node:https')
const multer = require('multer')
const sessionDataDefaults = require('./data/session-data-defaults')
const { createSubmissions, createBoundary, sections: submissionSections } = require('./data/submissions')
const router = govukPrototypeKit.requests.setupRouter()

const osMapApiOrigin = 'https://api.os.uk'
const osMapProxyPath = '/iteration-01/os-map-proxy'
const osMapResourcePathPrefix = '/maps/vector/v1/vts'

function getOsMapResponse(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, response => resolve(response))
    request.setTimeout(15000, () => request.destroy(new Error('Map request timed out')))
    request.on('error', reject)
  })
}

function getOsMapResourcePath(pathname) {
  const proxyPathPrefix = `${osMapProxyPath}/`
  if (!pathname.startsWith(proxyPathPrefix)) return null

  const pathSegments = pathname.slice(proxyPathPrefix.length).split('/')
  let decodedSegments
  try {
    decodedSegments = pathSegments.map(segment => decodeURIComponent(segment))
  } catch {
    return null
  }

  if (
    decodedSegments.some(segment =>
      !segment ||
      segment === '.' ||
      segment === '..' ||
      /[\/\\\u0000-\u001f]/.test(segment)
    ) ||
    `/${decodedSegments.slice(0, 4).join('/')}` !== osMapResourcePathPrefix
  ) {
    return null
  }

  return `/${decodedSegments.map(segment => encodeURIComponent(segment)).join('/')}`
}

async function proxyOsMapRequest(req, res) {
  const apiKey = process.env.ORDNANCE_SURVEY_API_KEY?.trim()
  if (!apiKey) {
    return res.status(503).send('Map service is not configured.')
  }

  const requestUrl = new URL(req.originalUrl, 'http://localhost')
  const resourcePath = getOsMapResourcePath(requestUrl.pathname)
  if (!resourcePath) {
    return res.status(404).send('Map resource not found.')
  }

  const upstreamUrl = new URL(resourcePath, osMapApiOrigin)
  for (const [name, value] of requestUrl.searchParams) {
    if (!['key', 'srs'].includes(name.toLowerCase())) {
      upstreamUrl.searchParams.append(name, value)
    }
  }
  upstreamUrl.searchParams.set('key', apiKey)
  upstreamUrl.searchParams.set('srs', '3857')

  try {
    const response = await getOsMapResponse(upstreamUrl)
    if (response.statusCode >= 300 && response.statusCode < 400) {
      response.resume()
      return res.status(502).send('Map resource is unavailable.')
    }
    if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
      const status = response.statusCode || 502
      response.resume()
      return res.status(status).send('Map resource is unavailable.')
    }

    const chunks = []
    for await (const chunk of response) chunks.push(chunk)
    res.set({
      'Content-Type': response.headers['content-type'] || 'application/octet-stream',
      'Cache-Control': response.headers['cache-control'] || 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff'
    })
    return res.send(Buffer.concat(chunks))
  } catch (error) {
    console.error('Ordnance Survey map request failed:', error.name)
    return res.status(502).send('Map resource is unavailable.')
  }
}

// Keep uploads in memory; image contents are stored in the user's prototype session.
const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

// Shared middleware: run before scenario setup and journey routes.

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
  // Keep the request/session debug log readable by excluding base64 image contents.
  let now = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })
  let data = JSON.stringify(req.session.data, (key, value) => key === 'logoImage' ? '[Uploaded image omitted]' : value, 2)
  console.log(`${now} ${req.url}\nsessiondata: ${data}\n\n`)
  next()
})

router.get('/iteration-01/os-map-proxy/*', (req, res) => {
  proxyOsMapRequest(req, res)
})

// Research scenarios: initialise session state, then redirect to the journey.

router.get('/iteration-01/create-form-scenario', (req, res) => {
  // Clone defaults so mutable arrays and objects are not shared between sessions.
  req.session.data = structuredClone(sessionDataDefaults)
  res.redirect('/iteration-01/start-page')
})

router.get('/iteration-01/submissions-scenario', (req, res) => {
  req.session.data.submissions = createSubmissions()
  req.session.data.submissionDownloads = {}
  req.session.data.formCreated = 'true'
  req.session.data.formPublished = 'true'
  req.session.data.formPublishedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London'
  })
  res.redirect('/iteration-01/dashboard')
})

router.get('/iteration-01/unpublish-scenario', (req, res) => {
  // Keep existing form customisations and submissions when preparing this task.
  req.session.data.formCreated = 'true'
  req.session.data.formPublished = 'true'
  req.session.data.formPublishedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London'
  })
  delete req.session.data.unpublishForm
  res.redirect('/iteration-01/dashboard')
})

// Form setup: optional local question, logo upload and branding.

router.post('/iteration-01/constraints-question-controller', (req, res, next) => {
  if (req.session.data['addQuestion'] === 'Yes') {
    return res.redirect('/iteration-01/enter-question')
  } else {
    return res.redirect('/iteration-01/upload-logo')
  }
})

router.post('/iteration-01/save-logo', logoUpload.single('logoUpload'), (req, res) => {
  // Continuing without a replacement file preserves the current logo.
  if (req.file) {
    req.session.data.logoUpload = req.file.originalname
    req.session.data.logoImage = {
      contentType: req.file.mimetype,
      base64: req.file.buffer.toString('base64')
    }
  }
  res.redirect('/iteration-01/choose-header-colour')
})

router.get('/iteration-01/logo', (req, res) => {
  // Serve only the current session's image, without caching or active SVG content.
  res.set('Cache-Control', 'no-store')
  const logo = req.session.data.logoImage
  if (!logo) {
    return res.status(404).send('No logo has been uploaded in this session.')
  }
  res.set({
    'Content-Type': logo.contentType,
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox"
  })
  res.send(Buffer.from(logo.base64, 'base64'))
})

// Form review and publication: redirect after updates to refresh template data.

router.post('/iteration-01/review-form', (req, res) => {
  req.session.data['formCreated'] = "true"
  if (req.session.data['unpublishForm'] === 'Yes') {
    req.session.data['formPublished'] = "false"
    req.session.data['formPublishedDate'] = null
    req.session.data.formUnpublished = true
  }
  delete req.session.data.unpublishForm
  res.redirect('/iteration-01/review-form')
})

router.get('/iteration-01/review-form', (req, res) => {
  req.session.data['formCreated'] = "true"
  // Consume the success flag so refreshing does not repeat the banner.
  const formUnpublished = req.session.data.formUnpublished
  delete req.session.data.formUnpublished

  res.render('iteration-01/review-form', {
    displayBanner: formUnpublished,
    bannerMessage: formUnpublished ? 'Form unpublished' : undefined
  })
})

router.all('/iteration-01/published-form', (req, res, next) => {
  // The Prototype Kit renders the matching template after this state update.
  req.session.data['formPublished'] = "true"

  next()
})

// Team access: session-only invitations, role changes and removal.

router.get('/iteration-01/manage-editors', (req, res) => {
  // Consume action messages once, and assign IDs to any pre-existing members.
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

router.all(['/iteration-01/change-team-member/:id', '/iteration-01/remove-team-member/:id'], (req, res, next) => {
  // Resolve the member for access changes and removal confirmation.
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
  delete req.session.data.updatedAccessLevel
  if (req.body.updatedAccessLevel === 'remove') {
    return res.redirect('/iteration-01/remove-team-member/' + req.params.id)
  }
  res.locals.member.role = req.body.updatedAccessLevel
  req.session.data.teamMemberMessage = 'Team member access updated'

  res.redirect('/iteration-01/manage-editors')
})

router.get('/iteration-01/remove-team-member/:id', (req, res) => {
  res.render('iteration-01/remove-team-member')
})

router.post('/iteration-01/remove-team-member/:id', (req, res) => {
  delete req.session.data.confirmRemoveTeamMember
  if (req.body.confirmRemoveTeamMember === 'Yes') {
    req.session.data.teamMembers = req.session.data.teamMembers.filter(member => member.id !== req.params.id)
    req.session.data.teamMemberMessage = 'Team member removed'
    return res.redirect('/iteration-01/manage-editors')
  }
  if (req.body.confirmRemoveTeamMember === 'No') {
    return res.redirect('/iteration-01/change-team-member/' + req.params.id)
  }
  res.redirect('/iteration-01/remove-team-member/' + req.params.id)
})

// Submissions: shared listing template, answer details and session-scoped map data.

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
    osMapsConfigured: Boolean(process.env.ORDNANCE_SURVEY_API_KEY?.trim()),
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
  // Preserve the older detail URL by selecting the session's first submission.
  const submission = req.session.data.submissions[0]
  res.redirect(submission ? '/iteration-01/view-submission/' + submission.reference : '/iteration-01/site-submissions')
})

// Download simulation: schedule processing without generating real download files.

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
  // Shared middleware completes the job on a later request after this delay.
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
  // The processing page refreshes until the simulated job has completed.
  res.set('Cache-Control', 'no-store')
  res.render('iteration-01/submission-download', {
    download,
    returnUrl: download.scope === 'new' ? '/iteration-01/site-submissions' : '/iteration-01/downloaded-sites'
  })
})
