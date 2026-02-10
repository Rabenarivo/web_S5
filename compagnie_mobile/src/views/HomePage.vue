<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Accueil</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleLogout">
            <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="user">
        <!-- Carte de bienvenue -->
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>Bienvenue</ion-card-subtitle>
            <ion-card-title>{{ user.info?.prenom }} {{ user.info?.nom }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-icon :icon="mailOutline" slot="start"></ion-icon>
                <ion-label>{{ user.utilisateur.email }}</ion-label>
              </ion-item>
              <ion-item>
                <ion-icon :icon="shieldCheckmarkOutline" slot="start"></ion-icon>
                <ion-label>
                  <p>Rôle</p>
                  <h3>{{ user.role?.code || 'N/A' }}</h3>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-icon :icon="checkmarkCircleOutline" slot="start" :color="user.etat?.code === 'ACTIF' ? 'success' : 'danger'"></ion-icon>
                <ion-label>
                  <p>État du compte</p>
                  <h3>{{ user.etat?.code || 'N/A' }}</h3>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-icon :icon="fingerPrintOutline" slot="start"></ion-icon>
                <ion-label>
                  <p>Authentification</p>
                  <h3>{{ user.utilisateur.source_auth }}</h3>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Menu de navigation -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Navigation</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item button @click="router.push('/profile')">
                <ion-icon :icon="personOutline" slot="start"></ion-icon>
                <ion-label>Mon profil</ion-label>
                <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
              </ion-item>
              <ion-item button @click="router.push('/signalements')">
                <ion-icon :icon="warningOutline" slot="start"></ion-icon>
                <ion-label>Signalements</ion-label>
                <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Statistiques (si disponible) -->
        <ion-card v-if="user.role?.code === 'MANAGER'">
          <ion-card-header>
            <ion-card-title>Zone Administrateur</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>Vous avez accès aux fonctionnalités d'administration.</p>
          </ion-card-content>
        </ion-card>
      </div>

      <div v-else class="error-container">
        <ion-text color="danger">
          <h2>Erreur de chargement</h2>
          <p>Impossible de charger les informations utilisateur.</p>
        </ion-text>
        <ion-button @click="handleLogout" expand="block">
          Se reconnecter
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
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
  IonIcon,
  IonButton,
  IonButtons,
  IonSpinner,
  IonText,
  toastController,
  alertController
} from '@ionic/vue';
import {
  logOutOutline,
  mailOutline,
  shieldCheckmarkOutline,
  checkmarkCircleOutline,
  fingerPrintOutline,
  personOutline,
  warningOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { useAuthHybrid } from '../composables/useAuthHybrid';

const router = useRouter();
const { user, logout, refreshUser, isAuthenticated, isActive, loading } = useAuthHybrid();

onMounted(async () => {
  // Vérifier l'authentification
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }

  // Vérifier si le compte est actif
  if (!isActive()) {
    const alert = await alertController.create({
      header: 'Compte inactif',
      message: 'Votre compte est inactif ou bloqué. Veuillez contacter l\'administrateur.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            handleLogout();
          }
        }
      ]
    });
    await alert.present();
    return;
  }

  // Rafraîchir les données utilisateur
  try {
    await refreshUser();
  } catch (error) {
    console.error('Erreur lors du rafraîchissement:', error);
  }
});

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
          try {
            await logout();
            const toast = await toastController.create({
              message: 'Déconnexion réussie',
              duration: 2000,
              color: 'success',
              position: 'top'
            });
            await toast.present();
            router.push('/login');
          } catch (error) {
            const toast = await toastController.create({
              message: 'Erreur lors de la déconnexion',
              duration: 2000,
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
  justify-content: center;
  align-items: center;
  height: 100%;
}

.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}

ion-card {
  margin-bottom: 16px;
}
</style>
