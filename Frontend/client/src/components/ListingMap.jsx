import { useEffect, useRef } from 'react'

const MAP_TOKEN = import.meta.env.VITE_MAP_TOKEN || ''

export default function ListingMap({ coordinates }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (!MAP_TOKEN || !coordinates || coordinates.length < 2) return

    const loadMap = async () => {
      const mapboxgl = (await import('mapbox-gl')).default
      await import('mapbox-gl/dist/mapbox-gl.css')

      if (mapInstance.current) return
      const [lng, lat] = coordinates
      mapInstance.current = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: 12,
        accessToken: MAP_TOKEN,
      })
      new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapInstance.current)
    }
    loadMap()
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [coordinates])

  if (!MAP_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        Map (set VITE_MAP_TOKEN for Mapbox)
      </div>
    )
  }

  return <div ref={mapRef} className="h-full w-full overflow-hidden rounded-lg" />
}
