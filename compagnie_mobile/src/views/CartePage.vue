<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Carte des Signalements</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="router.push('/recapitulation')">
            <ion-icon slot="icon-only" :icon="statsChartOutline"></ion-icon>
          </ion-button>
          <ion-button v-if="!isAuthenticated" @click="router.push('/login')">
            <ion-icon slot="icon-only" :icon="logInOutline"></ion-icon>
          </ion-button>
          <ion-button v-else @click="router.push('/profile')">
            <ion-icon slot="icon-only" :icon="personOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Statistiques rapides -->
      <div class="stats-bar ion-padding">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ filteredSignalements.length }}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-card stat-warning">
            <div class="stat-value">{{ getCountByStatus('NOUVEAU') }}</div>
            <div class="stat-label">Nouveaux</div>
          </div>
          <div class="stat-card stat-info">
            <div class="stat-value">{{ getCountByStatus('EN_COURS') }}</div>
            <div class="stat-label">En cours</div>
          </div>
          <div class="stat-card stat-success">
            <div class="stat-value">{{ getCountByStatus('TERMINE') }}</div>
            <div class="stat-label">Terminés</div>
          </div>
        </div>
      </div>

      <!-- Filtres (visible uniquement pour utilisateurs connectés) -->
      <div v-if="isAuthenticated" class="filters-container ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="filterOutline"></ion-icon>
              Filtres
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <!-- Filtre par statut -->
            <div class="filter-section">
              <ion-label class="filter-label">Statut</ion-label>
              <ion-segment v-model="filterStatus" @ionChange="applyFilters">
                <ion-segment-button value="ALL">
                  <ion-label>Tous</ion-label>
                </ion-segment-button>
                <ion-segment-button value="NOUVEAU">
                  <ion-label>Nouveaux</ion-label>
                </ion-segment-button>
                <ion-segment-button value="EN_COURS">
                  <ion-label>En cours</ion-label>
                </ion-segment-button>
                <ion-segment-button value="TERMINE">
                  <ion-label>Terminés</ion-label>
                </ion-segment-button>
              </ion-segment>
            </div>

            <!-- Filtre par date -->
            <div class="filter-section">
              <ion-label class="filter-label">Période</ion-label>
              <ion-segment v-model="filterDate" @ionChange="applyFilters">
                <ion-segment-button value="ALL">
                  <ion-label>Tout</ion-label>
                </ion-segment-button>
                <ion-segment-button value="TODAY">
                  <ion-label>Aujourd'hui</ion-label>
                </ion-segment-button>
                <ion-segment-button value="WEEK">
                  <ion-label>Cette semaine</ion-label>
                </ion-segment-button>
                <ion-segment-button value="MONTH">
                  <ion-label>Ce mois</ion-label>
                </ion-segment-button>
              </ion-segment>
            </div>

            <!-- Filtre mes signalements -->
            <div class="filter-section">
              <ion-item lines="none">
                <ion-icon :icon="personOutline" slot="start" color="primary"></ion-icon>
                <ion-label>Mes signalements uniquement</ion-label>
                <ion-toggle v-model="filterMySignalements" @ionChange="applyFilters"></ion-toggle>
              </ion-item>
            </div>

            <!-- Compteur de résultats -->
            <div class="filter-results">
              <ion-text color="medium">
                {{ filteredSignalements.length }} signalement(s) affiché(s)
              </ion-text>
              <ion-text v-if="filterMySignalements && filteredSignalements.length === 0" color="warning" class="no-results-text">
                <p>
                  <ion-icon :icon="alertCircleOutline"></ion-icon>
                  Vous n'avez pas encore créé de signalement
                </p>
              </ion-text>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Carte -->
      <div id="map" class="map-container"></div>

      <!-- Loading -->
      <div v-if="loading" class="loading-overlay">
        <ion-spinner></ion-spinner>
        <p>Chargement des signalements...</p>
      </div>

      <!-- Popup de détails -->
      <ion-modal :is-open="!!selectedSignalement" @didDismiss="selectedSignalement = null">
        <ion-header>
          <ion-toolbar>
            <ion-title>Détails du signalement</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="selectedSignalement = null">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content v-if="selectedSignalement" class="ion-padding">
          <ion-card>
            <ion-card-header>
              <ion-card-subtitle>
                <ion-badge :color="getStatusColor(selectedSignalement.statut)">
                  {{ getStatusLabel(selectedSignalement.statut) }}
                </ion-badge>
              </ion-card-subtitle>
              <ion-card-title>Signalement routier</ion-card-title>
            </ion-card-header>
            
            <!-- Photos du signalement -->
            <div v-if="selectedSignalement.photos && selectedSignalement.photos.length > 0" class="photos-gallery">
              <div class="photos-slider">
                <div 
                  v-for="(photoBase64, index) in selectedSignalement.photos" 
                  :key="index"
                  class="photo-item"
                >
                  <img 
                    :src="`data:image/jpeg;base64,${photoBase64}`" 
                    :alt="`Photo ${index + 1}`"
                    class="signalement-photo"
                  />
                  <div class="photo-counter">{{ index + 1 }}/{{ selectedSignalement.photos.length }}</div>
                </div>
              </div>
            </div>
            <div v-else-if="selectedSignalement.photo" class="photos-gallery">
              <img 
                :src="selectedSignalement.photo" 
                alt="Photo du signalement"
                class="signalement-photo"
              />
            </div>
            <div v-else class="photos-gallery">
              <img 
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop"
                alt="Route par défaut"
                class="signalement-photo"
              />
            </div>
            
            <ion-card-content>
              <ion-list>
                <ion-item>
                  <ion-icon :icon="locationOutline" slot="start"></ion-icon>
                  <ion-label>
                    <p>Coordonnées</p>
                    <h3>{{ selectedSignalement.latitude.toFixed(6) }}, {{ selectedSignalement.longitude.toFixed(6) }}</h3>
                  </ion-label>
                </ion-item>
                <ion-item v-if="selectedSignalement.description">
                  <ion-icon :icon="documentTextOutline" slot="start"></ion-icon>
                  <ion-label>
                    <p>Description</p>
                    <h3>{{ selectedSignalement.description }}</h3>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
                  <ion-label>
                    <p>Date de création</p>
                    <h3>{{ formatDate(selectedSignalement.date_creation) }}</h3>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-icon :icon="phonePortraitOutline" slot="start"></ion-icon>
                  <ion-label>
                    <p>Source</p>
                    <h3>{{ selectedSignalement.source }}</h3>
                  </ion-label>
                </ion-item>
              </ion-list>

              <ion-button expand="block" @click="openInMaps(selectedSignalement)" class="ion-margin-top">
                <ion-icon :icon="navigateOutline" slot="start"></ion-icon>
                Ouvrir dans Google Maps
              </ion-button>
            </ion-card-content>
          </ion-card>
        </ion-content>
      </ion-modal>
    </ion-content>

    <!-- FAB pour ajouter un signalement -->
    <ion-fab vertical="bottom" horizontal="start" slot="fixed">
      <ion-fab-button @click="handleAddSignalement" color="primary">
        <ion-icon :icon="addOutline"></ion-icon>
      </ion-fab-button>
    </ion-fab>

    <!-- FAB pour rafraîchir -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="loadSignalements">
        <ion-icon :icon="refreshOutline"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonModal,
  IonFab,
  IonFabButton,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonToggle,
  toastController
} from '@ionic/vue';
import {
  statsChartOutline,
  logInOutline,
  personOutline,
  locationOutline,
  documentTextOutline,
  calendarOutline,
  phonePortraitOutline,
  navigateOutline,
  closeOutline,
  refreshOutline,
  addOutline,
  filterOutline,
  alertCircleOutline
} from 'ionicons/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSignalements } from '../composables/useSignalements';

// Fixer les icônes Leaflet par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const router = useRouter();
const route = useRoute();
const { signalements, loading, getAll } = useSignalements();
const selectedSignalement = ref<any>(null);

// Filtres
const filterStatus = ref<string>('ALL');
const filterDate = ref<string>('ALL');
const filterMySignalements = ref<boolean>(false);
const isAuthenticated = ref<boolean>(false);
const currentUserId = ref<string | null>(null);

let map: L.Map | null = null;
const markers: L.Marker[] = [];

// Computed property pour les signalements filtrés
const filteredSignalements = computed(() => {
  let filtered = [...signalements.value];

  // Filtre par statut
  if (filterStatus.value !== 'ALL') {
    filtered = filtered.filter((s: any) => s.statut === filterStatus.value);
  }

  // Filtre par date
  if (filterDate.value !== 'ALL') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    filtered = filtered.filter((s: any) => {
      const signalementDate = s.date_creation?.toDate ? s.date_creation.toDate() : new Date(s.date_creation);
      
      switch (filterDate.value) {
        case 'TODAY':
          return signalementDate >= today;
        case 'WEEK': {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return signalementDate >= weekAgo;
        }
        case 'MONTH': {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return signalementDate >= monthAgo;
        }
        default:
          return true;
      }
    });
  }

  // Filtre mes signalements
  if (filterMySignalements.value && currentUserId.value) {
    const beforeFilter = filtered.length;
    filtered = filtered.filter((s: any) => s.id_utilisateur === currentUserId.value);
    console.log(`Filtre "Mes signalements": ${beforeFilter} -> ${filtered.length} signalements`);
    console.log('Current User ID:', currentUserId.value);
  }

  return filtered;
});

onMounted(() => {
  // Vérifier l'authentification
  const userProfile = localStorage.getItem('userProfile');
  isAuthenticated.value = !!userProfile;
  
  // Récupérer l'ID de l'utilisateur connecté
  if (userProfile) {
    try {
      const user = JSON.parse(userProfile);
      currentUserId.value = user.utilisateur?.id_utilisateur || null;
      console.log('User ID chargé:', currentUserId.value);
    } catch (e) {
      console.error('Erreur parsing userProfile:', e);
    }
  }
  
  // Attendre que le DOM soit complètement rendu
  setTimeout(() => {
    initMap();
    loadSignalements();
  }, 100);
});

// Watcher pour détecter les changements de query params
watch(() => route.query, (newQuery) => {
  if (newQuery.lat && newQuery.lng && map && signalements.value.length > 0) {
    const lat = parseFloat(newQuery.lat as string);
    const lng = parseFloat(newQuery.lng as string);
    const sigId = newQuery.id as string;
    
    // Zoomer et centrer sur le signalement
    setTimeout(() => {
      focusOnSignalement(lat, lng, sigId);
    }, 500);
  }
}, { immediate: false });

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

const initMap = () => {
  // Vérifier si une carte existe déjà et la supprimer
  if (map) {
    map.remove();
    map = null;
  }

  // Vérifier si le conteneur existe
  const container = document.getElementById('map');
  if (!container) {
    console.error('Map container not found');
    return;
  }

  // Réinitialiser le conteneur s'il a déjà été initialisé
  if ((container as any)._leaflet_id) {
    (container as any)._leaflet_id = undefined;
  }

  // Centrer sur Antananarivo par défaut
  const defaultLat = -18.8792;
  const defaultLng = 47.5079;

  try {
    map = L.map('map', {
      preferCanvas: true,
      attributionControl: true,
      zoomControl: true
    }).setView([defaultLat, defaultLng], 12);

    // Ajouter la couche OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 1
    }).addTo(map);

    // Force le redimensionnement de la carte après initialisation
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 200);

    console.log('Map initialized successfully');
  } catch (error) {
    console.error('Error initializing map:', error);
  }
};

const loadSignalements = async () => {
  try {
    await getAll();
    updateMarkers();
    
    // Si des coordonnées sont dans l'URL, zoomer dessus
    if (route.query.lat && route.query.lng) {
      const lat = parseFloat(route.query.lat as string);
      const lng = parseFloat(route.query.lng as string);
      const sigId = route.query.id as string;
      
      setTimeout(() => {
        focusOnSignalement(lat, lng, sigId);
      }, 500);
    }
  } catch (error: any) {
    const toast = await toastController.create({
      message: 'Erreur lors du chargement des signalements',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

const handleAddSignalement = async () => {
  const userProfile = localStorage.getItem('userProfile');
  
  if (userProfile) {
    // Utilisateur connecté, rediriger vers la page d'ajout
    router.push('/signalements/add');
  } else {
    // Utilisateur non connecté, demander de se connecter
    const toast = await toastController.create({
      message: 'Veuillez vous connecter pour créer un signalement',
      duration: 3000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
    
    // Rediriger vers la page de connexion après un court délai
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  }
};

const updateMarkers = () => {
  if (!map) return;

  // Supprimer les anciens marqueurs
  markers.forEach(marker => marker.remove());
  markers.length = 0;

  // Ajouter les nouveaux marqueurs (avec filtres appliqués)
  filteredSignalements.value.forEach((signalement: any) => {
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div class="marker-pin marker-${getStatusColor(signalement.statut)}"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    const marker = L.marker([signalement.latitude, signalement.longitude], { icon })
      .addTo(map!)
      .on('click', () => {
        selectedSignalement.value = signalement;
      });

    markers.push(marker);
  });

  // Ajuster la vue pour inclure tous les marqueurs
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
};

const getCountByStatus = (status: string) => {
  return filteredSignalements.value.filter((s: any) => s.statut === status).length;
};

const applyFilters = () => {
  // Les filtres sont appliqués automatiquement via computed property
  // On met juste à jour les marqueurs sur la carte
  updateMarkers();
};

const focusOnSignalement = (lat: number, lng: number, sigId: string) => {
  if (!map) return;
  
  // Zoomer et centrer sur le signalement
  map.setView([lat, lng], 16, {
    animate: true,
    duration: 1
  });
  
  // Nettoyer l'URL après le focus
  setTimeout(() => {
    router.replace({ path: '/carte', query: {} });
  }, 1000);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NOUVEAU': return 'warning';
    case 'EN_COURS': return 'primary';
    case 'TERMINE': return 'success';
    default: return 'medium';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'NOUVEAU': return 'Nouveau';
    case 'EN_COURS': return 'En cours';
    case 'TERMINE': return 'Terminé';
    default: return status;
  }
};

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const openInMaps = (signalement: any) => {
  const url = `https://www.google.com/maps?q=${signalement.latitude},${signalement.longitude}`;
  window.open(url, '_blank');
};
</script>

<style scoped>
.stats-bar {
  background: var(--ion-color-light);
  border-bottom: 1px solid var(--ion-color-light-shade);
}

.filters-container {
  background: var(--ion-background-color);
}

.filters-container ion-card {
  margin: 0;
}

.filters-container ion-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-section:last-of-type {
  margin-bottom: 0;
}

.filter-section ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.filter-results {
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid var(--ion-color-light-shade);
}

.no-results-text {
  display: block;
  margin-top: 8px;
  font-size: 13px;
}

.no-results-text p {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 4px 0 0 0;
}

ion-segment {
  margin-top: 8px;
}

ion-segment-button {
  font-size: 12px;
  min-height: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--ion-color-primary);
}

.stat-card.stat-warning .stat-value {
  color: var(--ion-color-warning);
}

.stat-card.stat-info .stat-value {
  color: var(--ion-color-primary);
}

.stat-card.stat-success .stat-value {
  color: var(--ion-color-success);
}

.stat-label {
  font-size: 11px;
  color: var(--ion-color-medium);
  margin-top: 4px;
  text-transform: uppercase;
}

.map-container {
  height: calc(100vh - 56px - 120px);
  width: 100%;
  background: #f0f0f0;
  position: relative;
  z-index: 1;
}

.map-container :deep(.leaflet-container) {
  height: 100%;
  width: 100%;
  background: #e0e0e0;
  z-index: 0;
}

.map-container :deep(.leaflet-tile-pane) {
  z-index: 1;
}

.map-container :deep(.leaflet-marker-pane) {
  z-index: 2;
}

.map-container :deep(.leaflet-tile) {
  max-width: none !important;
  max-height: none !important;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 1000;
}

.loading-overlay p {
  color: var(--ion-color-medium);
  margin: 0;
}

.photos-gallery {
  position: relative;
  width: 100%;
}

.photos-slider {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.photos-slider::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.photo-item {
  flex: 0 0 100%;
  scroll-snap-align: start;
  position: relative;
}

.photo-counter {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.signalement-photo {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 10px;
  }
  
  .signalement-photo {
    height: 200px;
  }
}
</style>

<style>
/* Styles globaux pour les marqueurs Leaflet */
.custom-marker {
  background: transparent;
  border: none;
}

.marker-pin {
  width: 24px;
  height: 24px;
  border-radius: 50% 50% 50% 0;
  position: relative;
  transform: rotate(-45deg);
  left: 50%;
  top: 50%;
  margin: -15px 0 0 -15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.marker-warning {
  background-color: var(--ion-color-warning);
}

.marker-primary {
  background-color: var(--ion-color-primary);
}

.marker-success {
  background-color: var(--ion-color-success);
}

.marker-medium {
  background-color: var(--ion-color-medium);
}

.marker-pin::after {
  content: '';
  width: 10px;
  height: 10px;
  margin: 7px 0 0 7px;
  background: white;
  position: absolute;
  border-radius: 50%;
}
</style>
