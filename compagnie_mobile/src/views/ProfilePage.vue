<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="user">
        <!-- Avatar et informations principales -->
        <div class="profile-header">
          <div class="avatar">
            <ion-icon :icon="personCircleOutline" class="avatar-icon"></ion-icon>
          </div>
          <h2>{{ user.info?.prenom }} {{ user.info?.nom }}</h2>
          <p>{{ user.utilisateur.email }}</p>
        </div>

        <!-- Formulaire de modification -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Informations personnelles</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form @submit.prevent="handleUpdateProfile">
              <ion-item>
                <ion-label position="floating">Nom</ion-label>
                <ion-input v-model="formData.nom" type="text" :disabled="loading"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Prénom</ion-label>
                <ion-input v-model="formData.prenom" type="text" :disabled="loading"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Email</ion-label>
                <ion-input v-model="user.utilisateur.email" type="email" disabled></ion-input>
              </ion-item>

              <ion-button
                expand="block"
                type="submit"
                :disabled="loading"
                class="ion-margin-top"
              >
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                <span v-else>Mettre à jour</span>
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>

        <!-- Informations du compte -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Informations du compte</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>
                  <h3>Rôle</h3>
                  <p>{{ user.role?.code || 'N/A' }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>État du compte</h3>
                  <p :class="user.etat?.code === 'ACTIF' ? 'text-success' : 'text-danger'">
                    {{ user.etat?.code || 'N/A' }}
                  </p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>Type d'authentification</h3>
                  <p>{{ user.utilisateur.source_auth }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>Date de création</h3>
                  <p>{{ formatDate(user.utilisateur.date_creation) }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Actions -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Actions</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button expand="block" color="danger" @click="handleLogout">
              <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
              Se déconnecter
            </ion-button>
          </ion-card-content>
        </ion-card>
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
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner,
  toastController,
  alertController
} from '@ionic/vue';
import {
  personCircleOutline,
  logOutOutline
} from 'ionicons/icons';
import { useAuthHybrid } from '../composables/useAuthHybrid';

const router = useRouter();
const { user, logout, refreshUser, updateUserInfo } = useAuthHybrid();
const loading = ref(false);

const formData = ref({
  nom: '',
  prenom: ''
});

onMounted(() => {
  if (user.value) {
    formData.value.nom = user.value.info?.nom || '';
    formData.value.prenom = user.value.info?.prenom || '';
  }
});

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  
  try {
    // Si c'est un Timestamp Firestore
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Si c'est déjà une Date ou une chaîne
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Erreur formatage date:', error);
    return 'N/A';
  }
};

const handleUpdateProfile = async () => {
  loading.value = true;
  try {
    await updateUserInfo(formData.value.nom, formData.value.prenom);

    const toast = await toastController.create({
      message: 'Profil mis à jour avec succès',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  } catch (error: any) {
    const toast = await toastController.create({
      message: error.message || 'Erreur lors de la mise à jour',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  const alert = await alertController.create({
    header: 'Déconnexion',
    message: 'Voulez-vous vraiment vous déconnecter ?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Déconnexion',
        role: 'destructive',
        handler: async () => {
          await logout();
          router.push('/login');
        }
      }
    ]
  });
  await alert.present();
};
</script>

<style scoped>
.profile-header {
  text-align: center;
  padding: 20px;
}

.avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: var(--ion-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 100px;
  color: white;
}

.profile-header h2 {
  margin: 10px 0;
  font-size: 24px;
}

.profile-header p {
  color: var(--ion-color-medium);
  margin: 5px 0;
}

.text-success {
  color: var(--ion-color-success);
}

.text-danger {
  color: var(--ion-color-danger);
}

ion-card {
  margin-bottom: 16px;
}
</style>
