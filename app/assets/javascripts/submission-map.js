const mapColours = {
  purple: '#330165',
  orange: '#C44200',
  turquoise: '#007A7A',
  pink: '#CD2380',
  green: '#217E01',
  dark_pink: '#6C003B',
  light_blue: '#2A72B2',
  dark_blue: '#001B4D'
}

const siteBoundaryStyle = {
  stroke: mapColours.orange,
  strokeOpacity: 1,
  strokeWidth: 4,
  fill: 'transparent'
}

const container = document.getElementById('submission-map')
const status = document.getElementById('submission-map-status')

function showMapError(error) {
  console.error('Submission map failed:', error)
  status.textContent = 'The map could not be loaded. The submission details are still available below.'
  status.hidden = false
}

async function initialiseSubmissionMap() {
  status.textContent = 'Loading site boundary map.'
  const response = await fetch(container.dataset.boundaryUrl)
  if (!response.ok) throw new Error(`Boundary request failed: ${response.status}`)
  const boundary = await response.json()
  const colours = getComputedStyle(container)
  const datasets = defra.datasetsPlugin({
    datasets: [{
      id: 'site-boundary',
      type: 'geojson',
      label: 'Site boundary',
      geojson: boundary,
      minZoom: 0,
      maxZoom: 24,
      showInKey: true,
      showInMenu: true,
      style: siteBoundaryStyle
    }]
  })
  container.hidden = false
  const map = new defra.InteractiveMap(container.id, {
    behaviour: 'inline',
    mapProvider: defra.maplibreProvider(),
    mapStyle: {
      id: 'light',
      url: 'https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/main/OS_VTS_3857_Light.json',
      attribution: `Contains OS data © Crown copyright and database rights ${new Date().getFullYear()}`,
      backgroundColor: colours.getPropertyValue('--map-background-colour').trim()
    },
    transformRequest(url) {
      const requestUrl = new URL(url, location.href)
      if (requestUrl.origin === 'https://api.os.uk') {
        const proxyUrl = new URL(container.dataset.osMapProxyUrl, location.href)
        proxyUrl.pathname += requestUrl.pathname
        for (const [name, value] of requestUrl.searchParams) {
          if (name.toLowerCase() !== 'key' && name.toLowerCase() !== 'srs') {
            proxyUrl.searchParams.append(name, value)
          }
        }
        proxyUrl.searchParams.set('srs', '3857')
        return { url: proxyUrl.toString() }
      }
      return { url }
    },
    center: boundary.features[0].geometry.coordinates[0][0],
    zoom: 16,
    hasExitButton: true,
    enableMoveControls: false,
    enableZoomControls: true,
    plugins: [datasets]
  })
  map.on('map:error', showMapError)
  map.on('map:ready', () => {
    map.fitToBounds(boundary.features[0])
    status.hidden = true
  })
}

if (container) {
  initialiseSubmissionMap().catch(showMapError)
}
