const siteBoundaries = require('./site-boundaries')

const submissions = [
  {
    location: '72 Guild Street, London',
    received: '4 February 2026',
    reference: '4UE-AUD-RL2',
    submittedBy: 'Martha Tiger',
    downloaded: false
  },
  {
    location: '100 Jump Road, London',
    received: '4 February 2026',
    reference: '5FE-AUD-JK2',
    submittedBy: 'Gari Baldi',
    downloaded: true
  },
  {
    location: '88 Madeupity Street, London',
    received: '24 January 2026',
    reference: '4UX-ABC-HN3',
    submittedBy: 'Jane Doe',
    downloaded: true
  },
  {
    location: '1 Really Not Real Road, London',
    received: '23 January 2026',
    reference: '2MW-XYZ-RP2',
    submittedBy: 'Maggie Smith',
    downloaded: true
  }
]

const sections = [
  {
    title: 'Submitted on behalf of someone else',
    answers: [
      ['Are you submitting this site on behalf of someone else?', 'Yes'],
      ['What type of person or organisation are you submitting this site on behalf of?', 'Company'],
      ['What is their main connection to the site?', 'Other'],
      ['Tell us what their connection to the site is', 'planning consultant'],
      ['Title (optional)', 'Not provided'],
      ['First name', 'Ann'],
      ['Last name', 'Plan'],
      ['Organisation (optional)', 'Not provided'],
      ['Telephone number', '07999999999'],
      ['Email address', 'annplan@madeup.com']
    ]
  },
  {
    title: 'Your details',
    answers: [
      ['Which best describes you or your organisation?', 'Company'],
      ['What is your main connection to the site?', 'Other'],
      ['Tell us what your connection to the site is', 'agent representing the site'],
      ['Title (optional)', 'Not provided'],
      ['First name', 'Deborah'],
      ['Last name', 'Smith'],
      ['Organisation (optional)', 'Not provided'],
      ['Telephone number', '07999999999'],
      ['Email address', 'deborahsmith@madeup.com']
    ]
  },
  {
    title: 'Site location and boundary',
    answers: [
      ['Site boundary selection method', 'Draw on map'],
      ['Site description', 'Plot of land next to a large supermarket']
    ]
  },
  {
    title: 'Constraints',
    answers: [
      ['Will you mitigate this constraint?', 'Yes'],
      ['How will you mitigate the flood constraint?', 'as part of a concept being design for the site, flooding engineers will be engaged to design a detailed flood mitigation strategy which would come forward with any proposal, this strategy is likely to rely on green and blue infrastructure and SuDs such as blue roofs, rain gardens and attenuation tanks.'],
      ['Aware of other constraints', 'No'],
      ['Is the site affected by airport safeguarding restrictions?', 'No']
    ]
  },
  {
    title: 'Site use',
    answers: [
      ['What is the site currently used for?', 'Other'],
      ['Tell us what the site is currently used for', 'travelling circus'],
      ['What is the current status of the site?', 'In active use'],
      ['Are there existing uses on this site with a lease?', 'Yes'],
      ['When do the current leases expire?', 'January 2027'],
      ['When are tenants expected to move out of the site?', 'January 2027'],
      ['What could the site be used for?', 'Residential'],
      ['How many homes will this site create?', '100'],
      ['Does the landowner support the development of this land?', 'Yes'],
      ['Are you willing for this site to be joined with adjacent sites or used for multiple developments?', 'I do not know'],
      ['Does the site have multiple land owners?', 'I do not know'],
      ['Are there any agreements between owners about developing this site?', 'I do not know'],
      ['Are there any access issues with the site?', 'No'],
      ['Is there existing vehicle access to and from the public highway?', 'Yes']
    ]
  },
  {
    title: 'Additional site information',
    answers: [
      ['Does the site have any contamination or pollution constraints?', 'Yes'],
      ['Tell us what dangerous substances are present at this site?', 'as landfill it is anticipated that there will be significant ground contamination on the site. detailed geotechnical investigation and sampling will be undertaken to determine the extent of the contamination and derive a strategy for remediation.'],
      ['Does the site have any of these constraints? (optional)', 'Legal restriction, disputes or contractual issues'],
      ['Tell us about these constraints', 'ransom strip owned by Hali-Day Corporation precludes access to the highway, this matter will need to be resolved privately to unlock the site for development.'],
      ['Has the site been marketed?', 'Yes'],
      ['Tell us how the site has been marketed', 'Marketing has been conducted by local estate agents'],
      ['When do you expect the site to be ready for development?', 'January 2029'],
      ['When do you expect the first units to be ready on site?', 'January 2028'],
      ['When do you expect the development to be complete?', 'January 2029'],
      ['Additional comments (optional)', 'The site is suitable, available and achievable for redevelopment as a commercial laundry facility. The proposal would make effective use of land currently occupied by a temporary and intermittent use, delivering economic benefits while supporting the objectives of sustainable growth. It is therefore requested that the site be promoted through the Local Plan Call for Sites process for allocation as an employment site.']
    ]
  }
]

module.exports = {
  createSubmissions: () => submissions.map(submission => ({ ...submission })),
  sections,
  createBoundary(reference) {
    const boundary = siteBoundaries[reference]
    if (!boundary) return null
    return {
      type: 'Feature',
      properties: { reference, name: boundary.name, source: boundary.source },
      geometry: {
        type: 'Polygon',
        coordinates: boundary.coordinates
      }
    }
  }
}
