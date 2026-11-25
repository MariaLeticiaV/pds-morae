import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Coordenadas aproximadas dos bairros para demonstração.
// Quando o backend estiver integrado, estes valores virão do cadastro dos imóveis.
const propertyCoordinates = {
  'Clima Bom': [-9.5680, -35.7750],
  'Benedito Bentes': [-9.5520, -35.7100],
  Farol: [-9.6350, -35.7350],
  'Village Campestre': [-9.5740, -35.7550],
};

// The public listings endpoint currently provides city/neighborhood, not the
// full address or coordinates. Keep unknown neighborhoods visible at city level.
const cityCoordinates = {
  'Maceió-AL': [-9.6498, -35.7089],
};

function createPriceIcon(price) {
  return L.divIcon({
    className: 'morae-price-marker-wrapper',
    html: `<span class="morae-price-marker">R$ ${price}</span>`,
    iconSize: [78, 34],
    iconAnchor: [39, 34],
  });
}

function createGroupIcon(count) {
  return L.divIcon({
    className: 'morae-cluster-marker-wrapper',
    html: `<span class="morae-cluster-marker">${count}<small> anúncios</small></span>`,
    iconSize: [92, 38],
    iconAnchor: [46, 38],
  });
}

export function MapView({ properties = [], className = '' }) {
  const mappedProperties = useMemo(
    () => properties
      .map((property) => ({
        ...property,
        coordinates: property.latitude != null && property.longitude != null
          && Number.isFinite(Number(property.latitude)) && Number.isFinite(Number(property.longitude))
          ? [Number(property.latitude), Number(property.longitude)]
          : propertyCoordinates[property.neighborhood]
            || cityCoordinates[`${property.city || 'Maceió'}-${property.state || 'AL'}`],
      }))
      .filter((property) => property.coordinates),
    [properties],
  );

  const markerGroups = useMemo(() => {
    const groups = new Map();
    for (const property of mappedProperties) {
      const key = property.coordinates.join(',');
      const group = groups.get(key) ?? { coordinates: property.coordinates, properties: [] };
      group.properties.push(property);
      groups.set(key, group);
    }
    return [...groups.entries()].map(([key, group]) => ({ key, ...group }));
  }, [mappedProperties]);

  return (
    <MapContainer
      center={[-9.6250, -35.7350]}
      zoom={12}
      scrollWheelZoom
      className={`morae-leaflet-map ${className}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markerGroups.map((group) => (
        <Marker
          key={group.key}
          position={group.coordinates}
          icon={group.properties.length > 1
            ? createGroupIcon(group.properties.length)
            : createPriceIcon(group.properties[0].price)}
        >
          <Popup>
            <div className="morae-map-popup">
              {group.properties.map((property, index) => (
                <div className="morae-map-popup-listing" key={property.id ?? property.listingId ?? index}>
                  <strong>{property.name}</strong>
                  <span>{property.neighborhood} · {property.city || 'Maceió'}/{property.state || 'AL'}</span>
                  <b>R$ {property.price}/mês</b>
                </div>
              ))}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
