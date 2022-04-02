# Blablapp React-Flask - Appli de chat instantannée

## Étapes d'installation :

Exportez l'app pour pouvoir lancer Flask via une simple commande export `FLASK_APP=app`

Facultatif, activation de l'auto-reload server : `export FLASK_ENV=development`

Créez l'environnement virtuel si vous ne l'avez pas déjà fait : `virtualenv venv`

Lancez l'environement virtuel `source ./venv/bin/activate sur Mac et Linux` (`./venv/Scripts/activate` sur Windows)

Installez les packages python : `pip3 install -r requirements.txt`

## Lancement de l'app :

Pour lancer l'environement virtuel `source ./venv/bin/activate sur Mac et Linux` (`./venv/Scripts/activate` sur Windows)

Pour lancer le front : `npm start`

Pour lancer l'api : `npm run start-backend` ou bien `cd ./api/ && flask run`