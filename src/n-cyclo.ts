import { NCyclo } from './NCyclo.js';
import config from '../env-config.json';

const { firebase } = window as any;

const firebaseConfig = {
    apiKey: config.API_KEY,
    authDomain: config.AUTH_DOMAIN,
    projectId: config.PROJECT_ID,
    storageBucket: config.STORAGE_BUCKET,
    messagingSenderId: config.MESSAGING_SENDER_ID,
    appId: config.APP_ID,
    measurementId: config.MEASUREMENT_ID
  };

firebase.initializeApp(firebaseConfig);


customElements.define('n-cyclo', NCyclo);
