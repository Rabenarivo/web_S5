<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mes Signalements</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openAddPage">
            <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Chargement...</p>
      </div>

      <!-- Liste des signalements -->
      <div v-else-if="signalements.length > 0">
        <ion-card v-for="signalement in signalements" :key="signalement.id">
          <ion-card-header>
            <ion-card-subtitle>
              <ion-icon :icon="locationOutline"></ion-icon>
              {{ signalement.latitude.toFixed(6) }}, {{ signalement.longitude.toFixed(6) }}
            </ion-card-subtitle>
            <ion-card-title>
              <ion-badge :color="getStatusColor(signalement.statut)">
                {{ signalement.statut }}
              </ion-badge>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <!-- Photo si elle existe -->
            <div v-if="signalement.photo" class="signalement-photo">
              <img :src="`data:image/jpeg;base64,${signalement.photo}`" alt="Photo du signalement" />
            </div>

            <ion-list>
              <ion-item>
                <ion-label class="ion-text-wrap">
                  <p>Description</p>
                  <h3>{{ signalement.description || 'Aucune description' }}</h3>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <p>Source</p>
                  <h3>{{ signalement.source || 'FIREBASE' }}</h3>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <p>Date de création</p>
                  <h3>{{ formatDate(signalement.date_creation) }}</h3>
                </ion-label>
              </ion-item>
            </ion-list>

            <div class="button-group">
              <ion-button 
                size="small" 
                fill="outline" 
                @click="viewOnMap(signalement)"
              >
                <ion-icon slot="start" :icon="mapOutline"></ion-icon>
                Voir sur la carte
              </ion-button>
              <ion-button 
                size="small" 
                fill="outline" 
                color="danger"
                @click="deleteSignalement(signalement.id!)"
              >
                <ion-icon slot="start" :icon="trashOutline"></ion-icon>
                Supprimer
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Aucun signalement -->
      <div v-else class="empty-state">
        <ion-icon :icon="warningOutline" class="empty-icon"></ion-icon>
        <h2>Aucun signalement</h2>
        <p>Vous n'avez pas encore créé de signalement</p>
        <ion-button @click="openAddPage" expand="block" class="ion-margin-top">
          <ion-icon slot="start" :icon="addOutline"></ion-icon>
          Créer un signalement
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner,
  IonBadge,
  toastController,
  alertController
} from '@ionic/vue';
import {
  addOutline,
  locationOutline,
  mapOutline,
  trashOutline,
  warningOutline
} from 'ionicons/icons';
import { useSignalements } from '../composables/useSignalements';
import { useAuthHybrid } from '../composables/useAuthHybrid';

const router = useRouter();
const { signalements, loading, getByUser, remove } = useSignalements();
const { user } = useAuthHybrid();

onMounted(async () => {
  await loadSignalements();
});

const loadSignalements = async () => {
  if (!user.value?.utilisateur.id_utilisateur) return;
  
  try {
    await getByUser(user.value.utilisateur.id_utilisateur);
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Erreur lors du chargement',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NOUVEAU':
      return 'primary';
    case 'EN_COURS':
      return 'warning';
    case 'TERMINE':
      return 'success';
    default:
      return 'medium';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  
  // Convertir Timestamp Firestore en Date
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const openAddPage = () => {
  router.push('/signalements/add');
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

const deleteSignalement = async (id: string) => {
  const alert = await alertController.create({
    header: 'Supprimer',
    message: 'Voulez-vous vraiment supprimer ce signalement ?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Supprimer',
        role: 'destructive',
        handler: async () => {
          try {
            await remove(id);
            const toast = await toastController.create({
              message: 'Signalement supprimé',
              duration: 2000,
              color: 'success',
              position: 'top'
            });
            await toast.present();
          } catch (error: any) {
            const toast = await toastController.create({
              message: error.message || 'Erreur lors de la suppression',
              duration: 3000,
              color: 'danger',
              position: 'top'
            });
            await toast.present();
          }
        }
      }
    ]
  });
  await alert.present();
};
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}

.empty-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 20px;
}

.empty-state h2 {
  margin: 10px 0;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.signalement-photo {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.signalement-photo img {
  width: 100%;
  height: auto;
  max-height: 250px;
  object-fit: cover;
  display: block;
}

ion-card {
  margin-bottom: 16px;
}
</style>
