<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/carte"></ion-back-button>
        </ion-buttons>
        <ion-title>Récapitulation</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="router.push('/carte')">
            <ion-icon slot="icon-only" :icon="mapOutline"></ion-icon>
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

    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Chargement des statistiques...</p>
      </div>

      <div v-else>
        <!-- En-tête -->
        <div class="header-section">
          <h1>Tableau de bord</h1>
          <p>Statistiques globales des signalements routiers</p>
        </div>

        <!-- Statistiques globales -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Statistiques globales</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="stats-grid-large">
              <div class="stat-item">
                <ion-icon :icon="warningOutline" class="stat-icon primary"></ion-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.nbTotal }}</div>
                  <div class="stat-label">Total signalements</div>
                </div>
              </div>
              <div class="stat-item">
                <ion-icon :icon="trendingUpOutline" class="stat-icon success"></ion-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.avancementPourcentage }}%</div>
                  <div class="stat-label">Avancement moyen</div>
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Mes signalements (si connecté) -->
        <ion-card v-if="isAuthenticated">
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="personOutline" class="title-icon"></ion-icon>
              Mes signalements
            </ion-card-title>
            <ion-card-subtitle>{{ mySignalements.length }} signalement(s)</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="mySignalements.length > 0">
              <ion-item 
                v-for="signalement in mySignalements" 
                :key="'my-' + signalement.id"
              >
                <ion-badge 
                  :color="getStatusColor(signalement.statut)" 
                  slot="start"
                >
                  {{ getStatusLabel(signalement.statut) }}
                </ion-badge>
                <ion-label>
                  <h3>{{ signalement.description || 'Signalement routier' }}</h3>
                  <p>{{ formatDate(signalement.date_creation) }}</p>
                  <p class="coordinates">{{ signalement.latitude.toFixed(4) }}, {{ signalement.longitude.toFixed(4) }}</p>
                </ion-label>
                <ion-button 
                  slot="end" 
                  fill="outline" 
                  size="small"
                  @click="viewOnMap(signalement)"
                >
                  <ion-icon slot="start" :icon="navigateOutline"></ion-icon>
                  Voir sur la carte
                </ion-button>
              </ion-item>
            </ion-list>
            <div v-else class="empty-state">
              <ion-icon :icon="alertCircleOutline" class="empty-icon"></ion-icon>
              <p>Vous n'avez pas encore créé de signalement</p>
              <ion-button @click="router.push('/signalements/add')">
                <ion-icon slot="start" :icon="addOutline"></ion-icon>
                Créer un signalement
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Statistiques par statut -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Répartition par statut</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-for="stat in statsByStatus" :key="stat.statut" class="status-row">
              <div class="status-header">
                <ion-badge :color="getStatusColor(stat.statut)">
                  {{ getStatusLabel(stat.statut) }}
                </ion-badge>
                <span class="status-count">{{ stat.nb }} signalement(s)</span>
              </div>
              
              <ion-progress-bar 
                :value="stat.pourcentage / 100" 
                :color="getStatusColor(stat.statut)"
                class="status-progress"
              ></ion-progress-bar>
              
              <div class="status-percentage">{{ stat.pourcentage }}%</div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Liste détaillée par statut -->
        <ion-card v-for="stat in statsByStatus" :key="'detail-' + stat.statut">
          <ion-card-header>
            <ion-card-subtitle>
              <ion-badge :color="getStatusColor(stat.statut)">
                {{ getStatusLabel(stat.statut) }}
              </ion-badge>
            </ion-card-subtitle>
            <ion-card-title>{{ stat.nb }} signalement(s)</ion-card-title>
          </ion-card-header>
          <ion-card-content v-if="stat.nb > 0">
            <ion-list>
              <ion-item 
                v-for="signalement in getSignalementsByStatus(stat.statut).slice(0, 5)" 
                :key="signalement.id"
                button
                @click="viewSignalement(signalement)"
              >
                <ion-icon :icon="locationOutline" slot="start" :color="getStatusColor(stat.statut)"></ion-icon>
                <ion-label>
                  <h3>{{ signalement.description || 'Signalement routier' }}</h3>
                  <p>{{ formatDate(signalement.date_creation) }}</p>
                  <p class="coordinates">{{ signalement.latitude.toFixed(4) }}, {{ signalement.longitude.toFixed(4) }}</p>
                </ion-label>
                <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
              </ion-item>
            </ion-list>
            <ion-button 
              v-if="getSignalementsByStatus(stat.statut).length > 5"
              expand="block" 
              fill="clear" 
              size="small"
              @click="showAllStatus(stat.statut)"
            >
              Voir tous les {{ getSignalementsByStatus(stat.statut).length }} signalements
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Signalements récents -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="timeOutline" class="title-icon"></ion-icon>
              Signalements récents
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item 
                v-for="signalement in recentSignalements" 
                :key="'recent-' + signalement.id"
                button
                @click="viewSignalement(signalement)"
              >
                <ion-badge 
                  :color="getStatusColor(signalement.statut)" 
                  slot="start"
                >
                  {{ getStatusLabel(signalement.statut) }}
                </ion-badge>
                <ion-label>
                  <h3>{{ signalement.description || 'Signalement routier' }}</h3>
                  <p>{{ formatDate(signalement.date_creation) }}</p>
                </ion-label>
                <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>

    <!-- FAB pour rafraîchir -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="loadSignalements">
        <ion-icon :icon="refreshOutline"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonProgressBar,
  IonSpinner,
  IonFab,
  IonFabButton,
  toastController
} from '@ionic/vue';
import {
  mapOutline,
  logInOutline,
  personOutline,
  warningOutline,
  trendingUpOutline,
  locationOutline,
  chevronForwardOutline,
  timeOutline,
  refreshOutline,
  navigateOutline,
  alertCircleOutline,
  addOutline
} from 'ionicons/icons';
import { useSignalements } from '../composables/useSignalements';

const router = useRouter();
const { signalements, loading, getAll } = useSignalements();

const isAuthenticated = ref<boolean>(false);
const currentUserId = ref<string | null>(null);

onMounted(() => {
  // Vérifier l'authentification
  const userProfile = localStorage.getItem('userProfile');
  isAuthenticated.value = !!userProfile;
  
  if (userProfile) {
    try {
      const user = JSON.parse(userProfile);
      currentUserId.value = user.utilisateur?.id_utilisateur || null;
    } catch (e) {
      console.error('Erreur parsing userProfile:', e);
    }
  }
  
  loadSignalements();
});

const loadSignalements = async () => {
  try {
    await getAll();
  } catch (error: any) {
    const toast = await toastController.create({
      message: 'Erreur lors du chargement des statistiques',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

// Calcul des statistiques globales
const stats = computed(() => {
  const nbTotal = signalements.value.length;
  
  // Calcul de l'avancement en %
  // NOUVEAU = 0%, EN_COURS = 50%, TERMINE = 100%
  const avancement = signalements.value.reduce((acc, sig: any) => {
    if (sig.statut === 'NOUVEAU') return acc + 0;
    if (sig.statut === 'EN_COURS') return acc + 50;
    if (sig.statut === 'TERMINE') return acc + 100;
    return acc;
  }, 0);

  const avancementPourcentage = nbTotal > 0 ? (avancement / nbTotal).toFixed(1) : '0';

  return {
    nbTotal,
    avancementPourcentage
  };
});

// Statistiques par statut
const statsByStatus = computed(() => {
  const statuts = ['NOUVEAU', 'EN_COURS', 'TERMINE'];
  
  return statuts.map(statut => {
    const signalementsStatut = signalements.value.filter((s: any) => s.statut === statut);
    const nb = signalementsStatut.length;
    
    const pourcentage = signalements.value.length > 0 
      ? ((nb / signalements.value.length) * 100).toFixed(1)
      : '0';

    return {
      statut,
      nb,
      pourcentage
    };
  });
});

// Signalements récents (5 derniers)
const recentSignalements = computed(() => {
  return [...signalements.value]
    .sort((a: any, b: any) => {
      const dateA = a.date_creation?.toDate ? a.date_creation.toDate() : new Date(a.date_creation);
      const dateB = b.date_creation?.toDate ? b.date_creation.toDate() : new Date(b.date_creation);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);
});

// Mes signalements (utilisateur connecté)
const mySignalements = computed(() => {
  if (!currentUserId.value) return [];
  
  return signalements.value.filter((s: any) => s.id_utilisateur === currentUserId.value)
    .sort((a: any, b: any) => {
      const dateA = a.date_creation?.toDate ? a.date_creation.toDate() : new Date(a.date_creation);
      const dateB = b.date_creation?.toDate ? b.date_creation.toDate() : new Date(b.date_creation);
      return dateB.getTime() - dateA.getTime();
    });
});

const getSignalementsByStatus = (status: string) => {
  return signalements.value.filter((s: any) => s.statut === status);
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

const viewSignalement = (signalement: any) => {
  router.push({
    path: '/carte',
    query: {
      lat: signalement.latitude,
      lng: signalement.longitude,
      id: signalement.id
    }
  });
};

const viewOnMap = (signalement: any) => {
  // Rediriger vers la carte avec les coordonnées du signalement
  router.push({
    path: '/carte',
    query: {
      lat: signalement.latitude,
      lng: signalement.longitude,
      id: signalement.id
    }
  });
};

const showAllStatus = (status: string) => {
  router.push('/carte');
};
</script>

<style scoped>
.header-section {
  text-align: center;
  margin-bottom: 20px;
}

.header-section h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: bold;
}

.header-section p {
  margin: 0;
  color: var(--ion-color-medium);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.loading-container p {
  color: var(--ion-color-medium);
  margin: 0;
}

.stats-grid-large {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 12px;
}

.stat-icon {
  font-size: 32px;
}

.stat-icon.primary {
  color: var(--ion-color-primary);
}

.stat-icon.success {
  color: var(--ion-color-success);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

.status-row {
  padding: 12px 0;
  border-bottom: 1px solid var(--ion-color-light);
}

.status-row:last-child {
  border-bottom: none;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-count {
  font-size: 14px;
  color: var(--ion-color-medium);
}

.status-progress {
  height: 8px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.status-percentage {
  text-align: right;
  font-size: 14px;
  font-weight: bold;
  color: var(--ion-color-medium);
}

.coordinates {
  font-size: 11px;
  color: var(--ion-color-medium);
  font-family: monospace;
}

.title-icon {
  margin-right: 8px;
  vertical-align: middle;
}

ion-card {
  margin-bottom: 16px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--ion-color-medium);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

@media (max-width: 576px) {
  .stats-grid-large {
    grid-template-columns: 1fr;
  }

  .header-section h1 {
    font-size: 24px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
