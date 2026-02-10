<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Inscription</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="register-container">
        <div class="header-section">
          <h2>Créer un compte</h2>
          <p>Rejoignez Compagnie Mobile</p>
        </div>

        <ion-card>
          <ion-card-content>
            <!-- Type d'authentification -->
            <ion-segment v-model="authType">
              <ion-segment-button value="firebase">
                <ion-label>Firebase</ion-label>
              </ion-segment-button>
            </ion-segment>

            <form @submit.prevent="handleRegister">
              <!-- Informations personnelles -->
              <div class="form-section">
                <ion-text color="medium">
                  <h4>Informations personnelles</h4>
                </ion-text>

                <ion-item>
                  <ion-label position="floating">Nom</ion-label>
                  <ion-input
                    v-model="nom"
                    type="text"
                    :disabled="loading"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="floating">Prénom</ion-label>
                  <ion-input
                    v-model="prenom"
                    type="text"
                    :disabled="loading"
                  ></ion-input>
                </ion-item>
              </div>

              <!-- Informations de connexion -->
              <div class="form-section">
                <ion-text color="medium">
                  <h4>Informations de connexion</h4>
                </ion-text>

                <ion-item>
                  <ion-label position="floating">Email *</ion-label>
                  <ion-input
                    v-model="email"
                    type="email"
                    required
                    autocomplete="email"
                    :disabled="loading"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="floating">Mot de passe *</ion-label>
                  <ion-input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    autocomplete="new-password"
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

                <ion-item>
                  <ion-label position="floating">Confirmer mot de passe *</ion-label>
                  <ion-input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    required
                    autocomplete="new-password"
                    :disabled="loading"
                  ></ion-input>
                  <ion-button
                    slot="end"
                    fill="clear"
                    @click="showConfirmPassword = !showConfirmPassword"
                    :disabled="loading"
                  >
                    <ion-icon
                      slot="icon-only"
                      :icon="showConfirmPassword ? eyeOffOutline : eyeOutline"
                    ></ion-icon>
                  </ion-button>
                </ion-item>

                <!-- Indicateur de force du mot de passe -->
                <div v-if="password" class="password-strength">
                  <ion-text :color="passwordStrengthColor">
                    <small>{{ passwordStrengthText }}</small>
                  </ion-text>
                  <ion-progress-bar
                    :value="passwordStrength / 100"
                    :color="passwordStrengthColor"
                  ></ion-progress-bar>
                </div>
              </div>

              <!-- Messages d'erreur -->
              <ion-text color="danger" v-if="error" class="error-text">
                <p>
                  <ion-icon :icon="alertCircleOutline"></ion-icon>
                  {{ error }}
                </p>
              </ion-text>

              <!-- Validation du mot de passe -->
              <ion-text color="warning" v-if="password !== confirmPassword && confirmPassword" class="warning-text">
                <p>
                  <ion-icon :icon="warningOutline"></ion-icon>
                  Les mots de passe ne correspondent pas
                </p>
              </ion-text>

              <!-- Bouton d'inscription -->
              <ion-button
                expand="block"
                type="submit"
                :disabled="loading || !isFormValid"
                class="ion-margin-top"
                color="primary"
              >
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                <span v-else>S'inscrire</span>
              </ion-button>

              <div class="links-section">
                <ion-button fill="clear" size="small" @click="goToLogin">
                  Déjà un compte ? Se connecter
                </ion-button>
              </div>
            </form>
          </ion-card-content>
        </ion-card>

        <div class="info-section" v-if="authType === 'firebase'">
          <ion-text color="medium">
            <p>
              <ion-icon :icon="shieldCheckmarkOutline"></ion-icon>
              Vos données sont sécurisées avec Firebase et PostgreSQL
            </p>
          </ion-text>
        </div>
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
  IonProgressBar,
  toastController,
  alertController
} from '@ionic/vue';
import {
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline,
  warningOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { useAuthHybrid } from '../composables/useAuthHybrid';

const router = useRouter();
const { register, error, loading } = useAuthHybrid();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const nom = ref('');
const prenom = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const authType = ref<'firebase'>('firebase');

// Validation du formulaire
const isFormValid = computed(() => {
  return (
    email.value &&
    password.value &&
    confirmPassword.value &&
    password.value === confirmPassword.value &&
    password.value.length >= 6
  );
});

// Calcul de la force du mot de passe
const passwordStrength = computed(() => {
  const pwd = password.value;
  let strength = 0;

  if (pwd.length >= 6) strength += 20;
  if (pwd.length >= 8) strength += 20;
  if (/[a-z]/.test(pwd)) strength += 20;
  if (/[A-Z]/.test(pwd)) strength += 20;
  if (/[0-9]/.test(pwd)) strength += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;

  return strength;
});

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 40) return 'danger';
  if (passwordStrength.value < 70) return 'warning';
  return 'success';
});

const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 40) return 'Mot de passe faible';
  if (passwordStrength.value < 70) return 'Mot de passe moyen';
  return 'Mot de passe fort';
});

const handleRegister = async () => {
  // Vérification finale
  if (password.value !== confirmPassword.value) {
    const alert = await alertController.create({
      header: 'Erreur',
      message: 'Les mots de passe ne correspondent pas',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  if (password.value.length < 6) {
    const alert = await alertController.create({
      header: 'Erreur',
      message: 'Le mot de passe doit contenir au moins 6 caractères',
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  try {
    await register(
      email.value,
      password.value,
      nom.value || undefined,
      prenom.value || undefined
    );

    // Message de succès
    const toast = await toastController.create({
      message: 'Inscription réussie ! Bienvenue !',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    // Redirection vers la carte
    router.push('/carte');
  } catch (err: any) {
    const toast = await toastController.create({
      message: error.value || 'Erreur lors de l\'inscription',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 20px;
}

.header-section h2 {
  margin: 10px 0;
  font-size: 24px;
  font-weight: bold;
}

.header-section p {
  color: var(--ion-color-medium);
  margin: 5px 0;
}

.form-section {
  margin: 20px 0;
}

.form-section h4 {
  margin: 10px 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.password-strength {
  margin: 10px 16px;
}

.password-strength small {
  font-size: 12px;
}

ion-progress-bar {
  margin-top: 5px;
  height: 4px;
}

.error-text,
.warning-text {
  display: flex;
  align-items: center;
  margin: 10px 16px;
  font-size: 14px;
}

.error-text ion-icon,
.warning-text ion-icon {
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
  height: 48px;
  font-weight: 600;
}

ion-segment {
  margin-bottom: 20px;
}

ion-card {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>
