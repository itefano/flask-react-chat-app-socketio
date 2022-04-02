# Blablapp React-Flask - Appli de chat instantannée

## Étapes d'installation :

Exportez l'app pour pouvoir lancer Flask via une simple commande export `FLASK_APP=app`

Facultatif, activation de l'auto-reload server : `export FLASK_ENV=development`

Créez l'environnement virtuel si vous ne l'avez pas déjà fait : `virtualenv venv`

Lancez l'environement virtuel `source ./venv/bin/activate sur Mac et Linux` (`./venv/Scripts/activate` sur Windows)

Installez les packages python : `pip3 install -r requirements.txt`

## Préparation de la db : 

Création de la db (via les models) : `python3 ./api/init_db.py`

Suppression de la db : `python3 ./api/drop_all.py`

Création + seeding de la db avec de fausses données (attention, ceci supprime toutes les données existantes. Ne pas utiliser en prod !) : `python3 ./api/seed_db.py`

## Lancement de l'app :

Pour lancer l'environement virtuel `source ./venv/bin/activate sur Mac et Linux` (`./venv/Scripts/activate` sur Windows)

Pour lancer le front : `npm start`

Pour lancer l'api : `npm run start-backend` ou bien `cd ./api/ && flask run`