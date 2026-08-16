import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

const MAP_TOKEN = import.meta.env.VITE_MAP_TOKEN || ''

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const DAY_COLORS = [
  '#e11d48', '#ea580c', '#ca8a04', '#65a30d', '#059669',
  '#0d9488', '#0891b2', '#2563eb', '#7c3aed', '#c026d3',
  '#db2777', '#be185d',
]

const DAY_SHAPES = ['circle', 'rounded-square', 'triangle', 'diamond']

function getDayColor(dayNumber) {
  return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length]
}

function getDayShape(dayNumber) {
  return DAY_SHAPES[(dayNumber - 1) % DAY_SHAPES.length]
}

const ItineraryMap = forwardRef(function ItineraryMap(
  { locations, showDayLabels = false, activeDay = null },
  ref
) {
  const mapContainerRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])

  const validLocations = (locations || []).filter(
    (l) => l?.lat != null && l?.lng != null
  )
  const locationsKey = validLocations
    .map((l) => `${l.lat},${l.lng},${l.dayNumber || l.order}`)
    .join('|')

  useImperativeHandle(ref, () => ({
    flyTo(lng, lat) {
      if (mapInstance.current) {
        mapInstance.current.flyTo({ center: [lng, lat], zoom: 15, duration: 1500 })
      }
    },
  }))

  useEffect(() => {
    if (!MAP_TOKEN || validLocations.length === 0) return

    const loadMap = async () => {
      const mapboxgl = (await import('mapbox-gl')).default
      await import('mapbox-gl/dist/mapbox-gl.css')

      if (mapInstance.current) return

      const lngs = validLocations.map((l) => l.lng)
      const lats = validLocations.map((l) => l.lat)
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2

      mapInstance.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [centerLng, centerLat],
        zoom: 11,
        accessToken: MAP_TOKEN,
      })

      mapInstance.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      )

      mapInstance.current.on('load', () => {
        const map = mapInstance.current
        if (!map) return

        // Per-day route lines
        const dayGroups = {}
        validLocations.forEach((loc) => {
            const d = (loc.dayNumber ?? Math.ceil((loc.order ?? 1) / 3)) || 1
          if (!dayGroups[d]) dayGroups[d] = []
          dayGroups[d].push([loc.lng, loc.lat])
        })

        Object.entries(dayGroups).forEach(([dayNum, coords]) => {
          if (coords.length < 2) return
          const color = getDayColor(Number(dayNum))
          const sourceId = `route-day-${dayNum}`
          map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: coords },
            },
          })
          map.addLayer({
            id: `${sourceId}-glow`,
            type: 'line',
            source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': color,
              'line-width': 8,
              'line-opacity': 0.2,
              'line-blur': 2,
            },
          })
          map.addLayer({
            id: `${sourceId}-line`,
            type: 'line',
            source: sourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': color,
              'line-width': 3,
              'line-opacity': 0.8,
              'line-dasharray': [2, 1],
            },
          })
        })

        // Markers
        validLocations.forEach((loc, i) => {
          const dayNum = (loc.dayNumber ?? Math.ceil((i + 1) / 3)) || 1
          const orderNum = loc.order ?? i + 1
          const color = getDayColor(dayNum)
          const shape = getDayShape(dayNum)
          const dayLabel = `D${dayNum}`

          const el = document.createElement('div')
          el.className = 'itinerary-marker'
          el.dataset.day = String(dayNum)

          const baseStyle = {
            width: '34px',
            height: '34px',
            backgroundColor: color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '11px',
            border: '3px solid white',
            boxShadow: '0 3px 10px rgba(0,0,0,0.35)',
            cursor: 'pointer',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            transition: 'opacity 0.3s, transform 0.3s',
          }

          if (shape === 'circle') {
            baseStyle.borderRadius = '50%'
            el.textContent = dayLabel
          } else if (shape === 'rounded-square') {
            baseStyle.borderRadius = '8px'
            el.textContent = dayLabel
          } else if (shape === 'triangle') {
            baseStyle.borderRadius = '0'
            baseStyle.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'
            el.textContent = dayLabel
          } else {
            baseStyle.borderRadius = '4px'
            baseStyle.transform = 'rotate(45deg)'
            const inner = document.createElement('span')
            inner.textContent = dayLabel
            inner.setAttribute(
              'style',
              'transform: rotate(-45deg); display: block; line-height: 1'
            )
            el.appendChild(inner)
          }

          Object.assign(el.style, baseStyle)

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([loc.lng, loc.lat])
            .setPopup(
              new mapboxgl.Popup({
                offset: 14,
                className: 'itinerary-popup',
                maxWidth: '280px',
              }).setHTML(
                `<div style="padding:2px 0"><strong style="font-size:15px">${escapeHtml(
                  loc.name || 'Stop ' + orderNum
                )}</strong></div>` +
                  `<div style="margin-top:6px;font-size:12px;color:${color};font-weight:600">Day ${dayNum} · Stop ${orderNum}</div>`
              )
            )
            .addTo(map)
          markersRef.current.push(marker)
        })

        const bounds = new mapboxgl.LngLatBounds()
        validLocations.forEach((l) => bounds.extend([l.lng, l.lat]))
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 })
      })
    }
    loadMap()
    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [locationsKey, showDayLabels])

  // Highlight active day markers (dim others)
  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const el = marker.getElement()
      if (!el) return
      const markerDay = Number(el.dataset.day)
      if (activeDay != null && markerDay !== activeDay) {
        el.style.opacity = '0.35'
        el.style.transform = el.dataset.day
          ? el.style.transform
          : 'scale(0.85)'
      } else {
        el.style.opacity = '1'
      }
    })

    // Also highlight/dim route lines
    if (mapInstance.current && mapInstance.current.isStyleLoaded()) {
      const map = mapInstance.current
      const allDays = [
        ...new Set(
          validLocations.map(
            (l) => (l.dayNumber ?? Math.ceil((l.order ?? 1) / 3)) || 1
          )
        ),
      ]
      allDays.forEach((d) => {
        const lineId = `route-day-${d}-line`
        const glowId = `route-day-${d}-glow`
        const isActive = activeDay == null || d === activeDay
        if (map.getLayer(lineId)) {
          map.setPaintProperty(lineId, 'line-opacity', isActive ? 0.8 : 0.15)
        }
        if (map.getLayer(glowId)) {
          map.setPaintProperty(glowId, 'line-opacity', isActive ? 0.2 : 0.05)
        }
      })
    }
  }, [activeDay, validLocations])

  if (!MAP_TOKEN) {
    return (
      <div className="flex h-full min-h-[320px] w-full items-center justify-center rounded-xl bg-muted text-muted-foreground">
        Map (set VITE_MAP_TOKEN for Mapbox)
      </div>
    )
  }

  if (validLocations.length === 0) {
    return null
  }

  const uniqueDays = (() => {
    const fromData = [
      ...new Set(validLocations.map((l) => l.dayNumber).filter(Boolean)),
    ].sort((a, b) => a - b)
    if (fromData.length > 0) return fromData
    const maxDay = Math.max(
      1,
      ...validLocations.map(
        (_, i) =>
          ((validLocations[i].dayNumber) ?? Math.ceil((i + 1) / 3)) || 1
      )
    )
    return Array.from({ length: maxDay }, (_, i) => i + 1)
  })()

  const shapeLabels = {
    circle: '●',
    'rounded-square': '■',
    triangle: '▲',
    diamond: '◆',
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-border shadow-lg">
      <div ref={mapContainerRef} className="h-[420px] w-full" />
      {validLocations.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border bg-muted/30 px-4 py-3">
          <span className="mr-1 text-xs font-medium text-muted-foreground">
            Legend:
          </span>
          {uniqueDays.map((dayNum) => {
            const color = getDayColor(dayNum)
            const shape = getDayShape(dayNum)
            const symbol = shapeLabels[shape] || '●'
            return (
              <span
                key={dayNum}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: color }}
                title={`Day ${dayNum} = ${shape} marker on map`}
              >
                <span className="opacity-90">{symbol}</span>
                Day {dayNum}
              </span>
            )
          })}
          <span className="self-center text-xs text-muted-foreground">
            · Tap a marker to see place name · Stops 1 →{' '}
            {validLocations.length}
          </span>
        </div>
      )}
    </div>
  )
})

export default ItineraryMap
