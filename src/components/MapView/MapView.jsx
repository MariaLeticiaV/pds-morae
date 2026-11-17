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

function createPriceIcon(price) {
  return L.divIcon({
    className: 'morae-price-marker-wrapper',
    html: `<span class="morae-price-marker">R$ ${price}</span>`,
    iconSize: [78, 34],
    iconAnchor: [39, 34],
  });
}

export function MapView({ properties = [], className = '' }) {
  const mappedProperties = useMemo(
    () => properties
      .map((property) => ({
        ...property,
        coordinates: property.latitude && property.longitude
          ? [property.latitude, property.longitude]
          : propertyCoordinates[property.neighborhood],
      }))
      .filter((property) => property.coordinates),
    [properties],
  );

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

      {mappedProperties.map((property) => (
        <Marker
          key={property.id}
          position={property.coordinates}
          icon={createPriceIcon(property.price)}
        >
          <Popup>
            <div className="morae-map-popup">
              <strong>{property.name}</strong>
              <span>{property.neighborhood} · Maceió/AL</span>
              <b>R$ {property.price}/mês</b>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
