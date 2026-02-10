<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/signalements"></ion-back-button>
        </ion-buttons>
        <ion-title>Nouveau signalement</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="add-signalement-container">
        <!-- Carte pour sélectionner la position -->
        <div class="map-container">
          <MapComponent
            map-id="add-signalement-map"
            :initial-lat="-18.9083"
            :initial-lng="47.5222"
            :initial-zoom="13"
            :clickable="true"
            :markers="currentMarkers"
            @map-click="handleMapClick"
          />
          <div class="map-instruction">
            <ion-icon :icon="locationOutline"></ion-icon>
            Cliquez sur la carte pour sélectionner l'emplacement
          </div>
        </div>

        <!-- Formulaire -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Détails du signalement</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <!-- Position sélectionnée -->
            <ion-item v-if="position">
              <ion-label>
                <h3>Position sélectionnée</h3>
                <p>Latitude: {{ position.lat.toFixed(6) }}</p>
                <p>Longitude: {{ position.lng.toFixed(6) }}</p>
              </ion-label>
              <ion-button 
                slot="end" 
                fill="clear"
                @click="useCurrentLocation"
              >
                <ion-icon slot="icon-only" :icon="navigateOutline"></ion-icon>
              </ion-button>
            </ion-item>

            <ion-item v-else>
              <ion-label color="warning">
                <h3>Aucune position sélectionnée</h3>
                <p>Cliquez sur la carte ou utilisez votre position actuelle</p>
              </ion-label>
              <ion-button 
                slot="end" 
                fill="clear"
                @click="useCurrentLocation"
              >
                <ion-icon slot="icon-only" :icon="navigateOutline"></ion-icon>
              </ion-button>
            </ion-item>

            <!-- Description -->
            <ion-item>
              <ion-label position="floating">Description *</ion-label>
              <ion-textarea 
                v-model="formData.description" 
                :rows="4"
                placeholder="Décrivez le problème de la route..."
                class="description-textarea"
              ></ion-textarea>
            </ion-item>

            <!-- Section Photos -->
            <ion-item>
              <ion-label>
                <h3>Photos de la route</h3>
                <p>Ajoutez jusqu'à 5 photos ({{ photos.length }}/5)</p>
              </ion-label>
            </ion-item>

            <!-- Bouton Ajouter une photo -->
            <div class="photo-section">
              <ion-button 
                expand="block" 
                fill="outline"
                @click="takePhoto"
                :disabled="loading || photos.length >= 5"
              >
                <ion-icon slot="start" :icon="cameraOutline"></ion-icon>
                Ajouter une photo ({{ photos.length }}/5)
              </ion-button>

              <!-- Grille de prévisualisation des photos -->
              <div v-if="photos.length > 0" class="photos-grid">
                <div v-for="(photo, index) in photos" :key="index" class="photo-preview">
                  <img :src="photo.url" :alt="`Photo ${index + 1}`" />
                  <ion-button 
                    fill="clear" 
                    color="danger"
                    size="small"
                    class="remove-photo-btn"
                    @click="removePhoto(index)"
                  >
                    <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
                  </ion-button>
                  <div class="photo-number">{{ index + 1 }}</div>
                </div>
              </div>
            </div>

            <!-- Boutons -->
            <div class="button-container">
              <ion-button 
                expand="block" 
                @click="handleSubmit"
                :disabled="!position || !formData.description.trim() || loading"
              >
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                <span v-else>
                  <ion-icon slot="start" :icon="checkmarkOutline"></ion-icon>
                  Créer le signalement
                </span>
              </ion-button>
              
              <ion-button 
                expand="block" 
                fill="outline" 
                color="medium"
                @click="router.back()"
              >
                Annuler
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSpinner,
  toastController,
  loadingController
} from '@ionic/vue';
import {
  locationOutline,
  navigateOutline,
  checkmarkOutline,
  cameraOutline,
  trashOutline
} from 'ionicons/icons';
import MapComponent from '../components/MapComponent.vue';
import { useSignalements } from '../composables/useSignalements';
import { useAuthHybrid } from '../composables/useAuthHybrid';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const router = useRouter();
const { create, loading } = useSignalements();
const { user } = useAuthHybrid();

const position = ref<{ lat: number; lng: number } | null>(null);
const formData = ref({
  description: ''
});
const photos = ref<Array<{ url: string; base64: string }>>([]);

// Marqueurs pour la carte
const currentMarkers = computed(() => {
  if (!position.value) return [];
  
  return [{
    lat: position.value.lat,
    lng: position.value.lng,
    iconHtml: `
      <div class="marker-pin marker-warning">
        <div class="marker-inner"></div>
      </div>
    `
  }];
});

// Handler pour le clic sur la carte
const handleMapClick = (pos: { lat: number; lng: number }) => {
  position.value = pos;
};

const useCurrentLocation = async () => {
  if (!navigator.geolocation) {
    const toast = await toastController.create({
      message: 'La géolocalisation n\'est pas disponible',
      duration: 3000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
    return;
  }

  const loadingIndicator = await loadingController.create({
    message: 'Récupération de votre position...',
  });
  await loadingIndicator.present();

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      position.value = { lat, lng };
      loadingIndicator.dismiss();
    },
    async (error) => {
      loadingIndicator.dismiss();
      const toast = await toastController.create({
        message: 'Impossible de récupérer votre position',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

const takePhoto = async () => {
  if (photos.value.length >= 5) {
    const toast = await toastController.create({
      message: 'Vous avez atteint la limite de 5 photos',
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
    return;
  }

  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      saveToGallery: false,
      correctOrientation: true,
      width: 1024,
      promptLabelHeader: 'Photo',
      promptLabelCancel: 'Annuler',
      promptLabelPhoto: 'Depuis la galerie',
      promptLabelPicture: 'Prendre une photo'
    });

    if (image.base64String) {
      photos.value.push({
        base64: image.base64String,
        url: `data:image/${image.format};base64,${image.base64String}`
      });

      const toast = await toastController.create({
        message: `Photo ${photos.value.length}/5 ajoutée`,
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    }
  } catch (error: any) {
    console.error('Erreur lors de la prise de photo:', error);
    
    if (error.message && !error.message.includes('User cancelled')) {
      const toast = await toastController.create({
        message: 'Erreur lors de la prise de photo',
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }
};

const removePhoto = (index: number) => {
  photos.value.splice(index, 1);
};

const handleSubmit = async () => {
  if (!position.value) {
    const toast = await toastController.create({
      message: 'Veuillez sélectionner une position sur la carte',
      duration: 3000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
    return;
  }

  if (!formData.value.description.trim()) {
    const toast = await toastController.create({
      message: 'Veuillez entrer une description',
      duration: 3000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
    return;
  }

  if (!user.value?.utilisateur.id_utilisateur) {
    const toast = await toastController.create({
      message: 'Vous devez être connecté',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
    return;
  }

  try {
    await create({
      id_utilisateur: user.value.utilisateur.id_utilisateur,
      latitude: position.value.lat,
      longitude: position.value.lng,
      source: 'FIREBASE',
      statut: 'NOUVEAU',
      description: formData.value.description.trim(),
      photo: photos.value.length > 0 ? photos.value[0].base64 : undefined, // Photo principale
      photos: photos.value.map(p => p.base64) // Toutes les photos
    });

    const toast = await toastController.create({
      message: 'Signalement créé avec succès',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    // Retourner à la liste
    router.push('/signalements');
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Erreur lors de la création',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};
</script>

<style scoped>
.add-signalement-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-container {
  position: relative;
  height: 50vh;
  min-height: 300px;
}

#map {
  width: 100%;
  height: 100%;
}

.map-instruction {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.map-instruction ion-icon {
  color: var(--ion-color-primary);
  font-size: 18px;
}

.button-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.photo-section {
  padding: 16px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.photo-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  aspect-ratio: 1;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-photo-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  --background: rgba(255, 255, 255, 0.9);
  --backdrop-filter: blur(10px);
  --border-radius: 50%;
  width: 32px;
  height: 32px;
}

.photo-number {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

ion-card {
  flex: 1;
  overflow-y: auto;
  margin: 0;
}

ion-item {
  --padding-start: 16px;
  --inner-padding-end: 16px;
}

.description-textarea {
  --background: var(--ion-color-light);
  --color: var(--ion-text-color);
  --padding-start: 0;
  --padding-end: 0;
  min-height: 100px;
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

.marker-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
}
</style>
