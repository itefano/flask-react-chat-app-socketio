# [ENGLISH :uk:/:us:] React-Flask (Socketio) - Instant chat app

## Description

> This a simple chat app, with no particular aim or goal. I'm just trying to learn more from React, Flask, SQLAlchemy and SocketIO. I'll improve whenever I feel like it, but feel free to give me any kind of **constructive** feedback if you have any.

## Install steps:

Start by exporting the Flask app `FLASK_APP=app`

#### Non-mandatory but recommended:
- Enable auto-reload on the server: `export FLASK_ENV=development`
- Create the virtual environment (if you didn't already do so): `virtualenv venv`
- Start the virtual environment: `source ./venv/bin/activate` on Mac & Linux (`./venv/Scripts/activate` on Windows)

Install the python packages with: `pip3 install -r requirements.txt`

Install the javascript packages with: `npm i`

## Database setup (PostgreSQL): 

> Note: if you want to start the app as is, you must [install postgreSQL first](https://www.postgresql.org/download/). You can tweak the database language if you want by editing the `.env` file and replace the dialect and log info with your own stuff.
> Note for Ubuntu & some unix users: psycopg2 seems to be somewhat capricious on some distribs, if you're having issues installing it, try to run `sudo apt-get install libpq-dev python-dev` (or your distribution's equivalent) before you proceed with the install.

First, create the Postgres database (you can also do this from from the psql interface), run: `sudo -u postgres chat_app_db` (Linux) or `createdb -u postgres` (MacOS/Windows).

Db creation (via models): `python3 ./api/init_db.py` (`py ./api/init_db.py` on Windows)


Db deletion: `python3 ./api/drop_all.py` (`py ./api/drop_all.py` on Windows)

Creation + seeding (warning, this will delete all user data. **DO NOT USE IN PRODUCTION**): `python3 ./api/seed_db.py` (`py ./api/seed_db.py` on Windows)

## Launching the app:

Reminder, start the virtual environment with : `source ./venv/bin/activate` on Mac & Linux (`./venv/Scripts/activate` on Windows)

To start ther front-end, use: `npm start`

To start the back-end, use: `npm run start-backend` or `cd ./api/ && Flask run`


## Current progress (guesstimated):

Back-end: 

███████████▁▁ ~85%

Front-end: 

█████████▁▁▁ ~75%

## Currently working features: 

- Login/Signin/logout
- Fake data seeding
- Friend system
- Chat (despite apparent lag, to be fixed later)
- Creation/deletion of chat groups
- Group management
- File display in chat (can't send for the moment)
- Darkmode
- Responsive
- Groups and contact search
- Primitive notification system
- Stories display


## Future features:

- Friend removal
- Profile management
- Group administration (different than management. Haven't fully decided on what this will be)
- Multimedia file sharing
- Email invitations
- Stories creations
- Automatic disconnect/reconnect on sockets
- Auto disconnect from server (especially sockets) when idle for too long (personal design choice).

---


# [Français :fr:] React-Flask (Socketio) - Appli de chat instantanée

## Description

> Ce projet est une simple appli de chat instantanée sans but particulier. J'essaye d'en apprendre un peu plus sur React, Flask, SQLAlchemy et SocketIO. Je travaillerai sur l'appli au fil de l'eau quand j'en aurais l'envie, mais n'hésitez pas à me faire du feedback **constructif** là où vous en verrez le besoin.

## Étapes d'installation :

Exportez l'app pour pouvoir lancer Flask via une simple commande export `FLASK_APP=app`

#### Facultatif mais recommandé :
- Activation de l'auto-reload server : `export FLASK_ENV=development`
- Création de l'environnement virtuel (si vous ne l'avez pas déjà fait) : `virtualenv venv`
- Initialisation de l'environement virtuel `source ./venv/bin/activate` sur Mac et Linux (`./venv/Scripts/activate` sur Windows)

Installez les packages python : `pip3 install -r requirements.txt`


Installez les packages javascript avec: `npm i`

## Préparation de la db (PostgreSQL): 

> Note: si vous voulez utiliser l'appli telle quelle, vous devez [installer postgreSQL d'abord](https://www.postgresql.org/download/). Vous pouvez aussi modifier le langage de base de données en éditant le fichier `.env` en remplaçant le dialecte ainsi que les données de connexion.
> Note concernant les utilisateurs d'unix : sous quelques distributions, le package psycopg2 a du mal à s'installer. Si c'est votre cas, essayez de lancer `sudo apt-get install libpq-dev python-dev` (ou l'équivalent sur votre distribution) puis de relancer l'installation.

Commencez par créer la db postgres (vous pouvez aussi effectuer cette opération depuis l'interface), lancez : `sudo -u postgres chat_app_db` (Linux) ou `createdb -u postgres` (MacOS/Windows).

Création de la db (via les models) : `python3 ./api/init_db.py` (`py ./api/init_db.py` sur Windows)

Suppression de la db : `python3 ./api/drop_all.py` (`py ./api/drop_all.py` sur Windows)

Création + seeding de la db avec de fausses données (attention, ceci supprime toutes les données existantes. **NE PAS UTILISER EN PROD**) : `python3 ./api/seed_db.py` (`py ./api/seed_db.py` sur Windows)

## Lancement de l'app :

Rappel, pour lancer l'environement virtuel : `source ./venv/bin/activate` sur Mac et Linux (`./venv/Scripts/activate` sur Windows)

Pour lancer le front : `npm start`

Pour lancer l'api : `npm run start-backend` ou bien `cd ./api/ && Flask run`


## Avancement (pifomètre) :

Back-end : 

███████████▁▁ ~85%

Front-end : 

█████████▁▁▁ ~75%

## Features fonctionnelles : 

- Connexion/deconnexion
- Création de compte
- Génération de set d'identification factices
- Ajout d'amis
- Chat (malgré une latence apparente)
- Création/suppression de groupes
- Edition des groupes
- Réception de fichiers au format image (pas d'envoi pour l'instant)
- Darkmode
- Responsive
- Recherche de groupes & de contact
- Système de notifications
- Affichage de stories


## Fonctionnalitées futures :

- Suppression de contacts
- Edition du profil
- Mise en place d'un système d'administration de groupes
- Envoi de fichiers multimedia
- Invitations par email
- Création de stories
- Déconnexion/reconnexion automatique des sockets
- Déconnexion automatique en cas de non-réponse du serveur

