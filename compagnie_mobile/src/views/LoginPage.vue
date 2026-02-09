<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <div class="logo-section">
          <ion-icon :icon="personCircleOutline" class="logo-icon"></ion-icon>
          <h1>Compagnie Mobile</h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        <ion-card>
          <ion-card-content>
            <!-- Type d'authentification -->
            <ion-segment v-model="authType" @ionChange="handleAuthTypeChange">
              <ion-segment-button value="firebase">
                <ion-label>Firebase</ion-label>
              </ion-segment-button>
            </ion-segment>

            <form @submit.prevent="handleLogin">
              <ion-item class="ion-margin-top">
                <ion-label position="floating">Email</ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  required
                  autocomplete="email"
                  :disabled="loading"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Mot de passe</ion-label>
                <ion-input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  :disabled="loading"
                ></ion-input>
                <ion-button
                  slot="end"
                  fill="clear"
                  @click="showPassword = !showPassword"
                  :disabled="loading"
                >
                  <ion-icon
                    slot="icon-only"
                    :icon="showPassword ? eyeOffOutline : eyeOutline"
                  ></ion-icon>
                </ion-button>
              </ion-item>

              <ion-text color="danger" v-if="error" class="error-text">
                <p><ion-icon :icon="alertCircleOutline"></ion-icon> {{ error }}</p>
              </ion-text>

              <ion-button
                expand="block"
                type="submit"
                :disabled="loading || !email || !password"
                class="ion-margin-top"
              >
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                <span v-else>Se connecter</span>
              </ion-button>

              <!-- <div class="links-section">
                <ion-button fill="clear" size="small" @click="goToRegister">
                  Pas de compte ? S'inscrire
                </ion-button>
              </div> -->
            </form>
          </ion-card-content>
        </ion-card>

        <div class="info-section" v-if="authType === 'firebase'">
          <ion-text color="medium">
            <p>
              <ion-icon :icon="informationCircleOutline"></ion-icon>
              Authentification via Firebase avec synchronisation PostgreSQL
            </p>
          </ion-text>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  toastController
} from '@ionic/vue';
import {
  personCircleOutline,
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { useAuthHybrid } from '../composables/useAuthHybrid';

const router = useRouter();
const { login, error, loading } = useAuthHybrid();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const authType = ref<'firebase'>('firebase');

const handleAuthTypeChange = () => {
  error.value = null;
};

const handleLogin = async () => {
  try {
    await login(email.value, password.value);

    // Afficher un message de succès
    const toast = await toastController.create({
      message: 'Connexion réussie !',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    // Rediriger vers la page d'accueil
    router.push('/home');
  } catch (err: any) {
    const toast = await toastController.create({
      message: error.value || 'Erreur de connexion',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-icon {
  font-size: 80px;
  color: var(--ion-color-primary);
  margin-bottom: 10px;
}

.logo-section h1 {
  margin: 10px 0;
  font-size: 28px;
  font-weight: bold;
}

.logo-section p {
  color: var(--ion-color-medium);
  margin: 5px 0;
}

ion-segment {
  margin-bottom: 20px;
}

.error-text {
  display: flex;
  align-items: center;
  margin-top: 10px;
  font-size: 14px;
}

.error-text ion-icon {
  margin-right: 5px;
  font-size: 18px;
}

.links-section {
  text-align: center;
  margin-top: 10px;
}

.info-section {
  margin-top: 20px;
  text-align: center;
}

.info-section p {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.info-section ion-icon {
  margin-right: 5px;
  font-size: 16px;
}

ion-button[type="submit"] {
  margin-top: 20px;
  height: 48px;
  font-weight: 600;
}

ion-card {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>
