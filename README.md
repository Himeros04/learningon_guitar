# 🎸 LearningOn-Guitar

**Application web de gestion de répertoire musical pour guitaristes**

LearningOn-Guitar est une Progressive Web App (PWA) conçue pour accompagner les guitaristes dans la gestion de leur répertoire musical. Elle permet d'organiser des partitions au format ChordPro, de visualiser des diagrammes d'accords, et d'utiliser des outils de pratique comme l'auto-scroll et la transposition.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![Firebase](https://img.shields.io/badge/Firebase-12.8.0-ffca28)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646cff)

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Architecture du projet](#-architecture-du-projet)
- [Installation](#-installation)
- [Configuration Firebase](#-configuration-firebase)
- [Développement](#-développement)
- [Déploiement](#-déploiement)
- [Format ChordPro](#-format-chordpro)

---

## ✨ Fonctionnalités

### 📚 Gestion de Bibliothèque
- Organisation des morceaux par **dossiers**
- **Recherche** par titre ou artiste
- Système de **favoris**
- Support des partitions **texte (ChordPro)** et **images**

### 🎼 Lecteur de Partition
- **Rendu ChordPro** avec alignement accords/paroles
- **Transposition** en temps réel (±12 demi-tons)
- **Auto-scroll** configurable basé sur la durée du morceau
- Affichage des **diagrammes d'accords** au clic

### 🎸 Bibliothèque d'Accords
- **100+ accords** standards pré-chargés
- Création d'**accords personnalisés**
- **Éditeur de diagramme** interactif (clic sur le manche)
- Gestion des **variantes** pour chaque accord

### 📱 Interface Responsive
- Design **mobile-first**
- Mode **sombre** élégant
- Effets **glassmorphism**
- Navigation tactile optimisée

---

## 🛠 Stack Technique

### Frontend

| Technologie | Version | Description |
|-------------|---------|-------------|
| **React** | 19.2.0 | Framework UI |
| **Vite** | 7.2.4 | Build tool & dev server |
| **React Router DOM** | 7.13.0 | Routage côté client |
| **Lucide React** | 0.563.0 | Icônes SVG |

### Backend (BaaS)

| Service | Description |
|---------|-------------|
| **Firebase Auth** | Authentification (Google + Email) |
| **Firestore** | Base de données NoSQL temps réel |
| **Firebase Storage** | Stockage d'images |
| **Firebase Hosting** | Hébergement de la webapp |

### Persistance Locale

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Dexie.js** | 4.3.0 | Wrapper IndexedDB pour mode offline |
| **dexie-react-hooks** | 4.2.0 | Hooks React pour Dexie |

### Utilitaires

| Technologie | Description |
|-------------|-------------|
| **heic2any** | Conversion d'images HEIC (iPhone) |
| **ESLint** | Linting du code |

---

## 📁 Architecture du projet

```
src/
├── App.jsx                    # Router principal + Auth
├── index.css                  # Design system (variables CSS)
├── main.jsx                   # Point d'entrée React
│
├── components/
│   ├── auth/
│   │   ├── LoginPage.jsx      # Page de connexion
│   │   └── ProtectedRoute.jsx # Protection des routes
│   │
│   ├── Library.jsx            # Liste des morceaux
│   ├── SongEditor.jsx         # Éditeur de partition
│   ├── SongRenderer.jsx       # Lecteur ChordPro
│   ├── ChordLibrary.jsx       # Bibliothèque d'accords
│   ├── ChordDetailModal.jsx   # Détail d'un accord
│   ├── ChordEditorModal.jsx   # Éditeur d'accord
│   ├── ChordDiagram.jsx       # Diagramme SVG
│   ├── FolderList.jsx         # Gestion des dossiers
│   ├── AutoScroller.jsx       # Défilement automatique
│   ├── ImageUploader.jsx      # Upload d'images
│   ├── ImageViewer.jsx        # Visualiseur d'images
│   ├── Settings.jsx           # Paramètres utilisateur
│   └── ConfirmModal.jsx       # Modale de confirmation
│
├── contexts/
│   └── AuthContext.jsx        # État d'authentification global
│
├── firebase/
│   ├── config.js              # Configuration Firebase
│   ├── auth.js                # Services d'authentification
│   ├── firestore.js           # CRUD Firestore
│   └── storage.js             # Upload/download fichiers
│
├── hooks/
│   └── useFirestore.js        # Hook personnalisé Firestore
│
├── db/
│   ├── db.js                  # Configuration Dexie (IndexedDB)
│   └── chords.js              # Database d'accords standards
│
└── utils/
    ├── chordProParser.js      # Parser format ChordPro
    ├── transposer.js          # Algorithme de transposition
    └── chordNormalizer.js     # Normalisation des formats
```

---

## 🚀 Installation

### Prérequis

- **Node.js** v18+ 
- **npm** v9+
- Un projet **Firebase** configuré

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/Himeros04/learningon_guitar.git
cd learningon_guitar

# 2. Installer les dépendances
npm install

# 3. Configurer Firebase (voir section suivante)

# 4. Lancer le serveur de développement
npm run dev
```

L'application sera accessible à **http://localhost:5173**

---

## 🔥 Configuration Firebase

### 1. Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un nouveau projet
3. Activer les services :
   - **Authentication** (Google + Email/Password)
   - **Firestore Database**
   - **Storage**
   - **Hosting**

### 2. Configurer le fichier de config

Créer/modifier `src/firebase/config.js` :

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 3. Règles de sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /songs/{songId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    match /folders/{folderId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 💻 Développement

### Scripts disponibles

```bash
# Serveur de développement avec Hot Reload
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Linting du code
npm run lint
```

### Variables d'environnement

Créer un fichier `.env.local` (optionnel) :

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

## 🌐 Déploiement

### Firebase Hosting

```bash
# 1. Build de production
npm run build

# 2. Déployer sur Firebase
firebase deploy
```

L'application sera accessible à :
- **https://learningon-guitar.web.app**
- **https://learningon-guitar.firebaseapp.com**

### Commandes Firebase utiles

```bash
# Déploiement preview (sans affecter la prod)
firebase hosting:channel:deploy preview

# Voir l'historique des déploiements
firebase hosting:releases:list

# Rollback vers une version précédente
firebase hosting:rollback
```

---

## 📝 Format ChordPro

L'application utilise le format **ChordPro** pour les partitions texte.

### Syntaxe de base

```
{title: Hotel California}
{artist: Eagles}

{soc}
[Am]On a dark desert highway, [E7]cool wind in my hair
[G]Warm smell of colitas, [D]rising up through the air
{eoc}

[F]Up ahead in the distance, [C]I saw a shimmering light
```

### Balises supportées

| Balise | Description |
|--------|-------------|
| `{title: ...}` | Titre du morceau |
| `{artist: ...}` | Nom de l'artiste |
| `{soc}` | Début de refrain (Start Of Chorus) |
| `{eoc}` | Fin de refrain (End Of Chorus) |
| `[Am]` | Accord placé au-dessus du texte |

---

## 📄 Licence

Ce projet est sous licence MIT.

---

## 👤 Auteur

**Himeros04**
- GitHub: [@Himeros04](https://github.com/Himeros04)

---

## 🙏 Remerciements

- [Lucide Icons](https://lucide.dev/) pour les icônes
- [Firebase](https://firebase.google.com/) pour le backend
- [Vite](https://vitejs.dev/) pour le tooling
