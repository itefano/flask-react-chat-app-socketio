# Blablapp React-Flask - Appli de chat instantannée

## Étapes d'installation :

Exportez l'app pour pouvoir lancer Flask via une simple commande export `FLASK_APP=app`

Facultatif, activation de l'auto-reload server : `export FLASK_ENV=development`

Créez l'environnement virtuel si vous ne l'avez pas déjà fait : `virtualenv venv`

Lancez l'environement virtuel `source ./venv/bin/activate sur Mac et Linux` (`./venv/Scripts/activate` sur Windows)

Installez les packages python : `pip3 install -r requirements.txts`

## Préparation de la db (PostgreSQL): 

Création de la db (via les models) : `python3 ./api/init_db.py`

Suppression de la db : `python3 ./api/drop_all.py`

Création + seeding de la db avec de fausses données (attention, ceci supprime toutes les données existantes. Ne pas utiliser en prod !) : `python3 ./api/seed_db.py`

## Lancement de l'app :

Pour lancer l'environement virtuel `source ./venv/bin/activate sur Mac et Linux` (`./venv/Scripts/activate` sur Windows)

Pour lancer le front : `npm start`

Pour lancer l'api : `npm run start-backend` ou bien `cd ./api/ && flask run`


## Avancement :

Back-end : 

████████▁▁ ~80%

Front-end : 

███████▁▁▁ ~70%

## Features fonctionnelles : 

- Connexion/deconnexion
- Création de compte
- Génération de set d'identification factices
- Ajout d'amis
- Chat (malgré une latence apparente)
- Création/suppression de groupes
- Possibilité de quitter un groupe
- Réception de fichiers au format image (pas d'envoi pour l'instant)
- Darkmode
- Responsive
- Recherche de groupes & de contact
- Système de notifications
- Affichage de stories


## Fonctionnalitées futures :

- Suppression de contacts
- Edition de groupes
- Edition du profil
- Mise en place d'un système d'administration de groupes
- Envoi de fichiers multimedia
- Invitations par email
- Création de stories
- Déconnexion/reconnexion automatique des sockets
- Déconnexion automatique en cas de non-réponse du serveur