<template>
  <div :id="mapId" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  mapId?: string;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  clickable?: boolean;
  markers?: Array<{
    lat: number;
    lng: number;
    iconHtml?: string;
    popupHtml?: string;
    onClick?: () => void;
  }>;
  focusPosition?: { lat: number; lng: number; zoom?: number } | null;
}

const props = withDefaults(defineProps<Props>(), {
  mapId: 'map',
  initialLat: -18.9083,
  initialLng: 47.5222,
  initialZoom: 12,
  clickable: false,
  markers: () => [],
  focusPosition: null
});

interface Emits {
  (e: 'mapClick', position: { lat: number; lng: number }): void;
  (e: 'mapReady', map: L.Map): void;
}

const emit = defineEmits<Emits>();

let map: L.Map | null = null;
const markersLayer = ref<L.LayerGroup | null>(null);

onMounted(() => {
  initMap();
});

const initMap = () => {
  if (map) return;

  // Initialiser la carte
  map = L.map(props.mapId).setView([props.initialLat, props.initialLng], props.initialZoom);

  // Ajouter les tuiles OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Créer un layer pour les marqueurs
  markersLayer.value = L.layerGroup().addTo(map);

  // Gérer les clics sur la carte si clickable
  if (props.clickable) {
    map.on('click', (e: L.LeafletMouseEvent) => {
      emit('mapClick', {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    });
  }

  // Émettre l'événement mapReady
  emit('mapReady', map);

  // Ajouter les marqueurs initiaux
  updateMarkers();
};

const updateMarkers = () => {
  if (!map || !markersLayer.value) return;

  // Effacer les marqueurs existants
  markersLayer.value.clearLayers();

  // Ajouter les nouveaux marqueurs
  props.markers.forEach(markerData => {
    if (!map || !markersLayer.value) return;

    const marker = L.marker([markerData.lat, markerData.lng], {
      icon: markerData.iconHtml
        ? L.divIcon({
            html: markerData.iconHtml,
            className: 'custom-marker',
            iconSize: [30, 42],
            iconAnchor: [15, 42]
          })
        : new L.Icon.Default()
    }).addTo(markersLayer.value);

    if (markerData.popupHtml) {
      marker.bindPopup(markerData.popupHtml);
    }

    if (markerData.onClick) {
      marker.on('click', markerData.onClick);
    }
  });
};

// Watcher pour les changements de marqueurs
watch(() => props.markers, () => {
  updateMarkers();
}, { deep: true });

// Watcher pour focusPosition
watch(() => props.focusPosition, (newPos) => {
  if (newPos && map) {
    const zoom = newPos.zoom !== undefined ? newPos.zoom : 16;
    map.setView([newPos.lat, newPos.lng], zoom);
  }
}, { deep: true });

// Méthode publique pour accéder à la carte
defineExpose({
  getMap: () => map,
  setView: (lat: number, lng: number, zoom?: number) => {
    if (map) {
      map.setView([lat, lng], zoom !== undefined ? zoom : map.getZoom());
    }
  },
  addMarker: (lat: number, lng: number, options?: L.MarkerOptions) => {
    if (map && markersLayer.value) {
      const marker = L.marker([lat, lng], options).addTo(markersLayer.value);
      return marker;
    }
    return null;
  },
  clearMarkers: () => {
    if (markersLayer.value) {
      markersLayer.value.clearLayers();
    }
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
