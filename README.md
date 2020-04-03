# Pictionary

L'adresse de l'application est : https://clerc-dejaham-pictionary.herokuapp.com/

## Pré-requis

### Installation de nodejs et npm :
 - curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
 - sudo apt install nodejs
 
### Installation d'Heroku :
 - curl https://cli-assets.heroku.com/install.sh | sh
 
### Installation de yarn :
 - curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
 - sudo tee /etc/apt/sources.list.d/yarn.list
 - sudo apt update
 - sudo apt install yarn

## Commandes Git

### Push
 - git add .
 - git commit -m "Message"
 - git push
 
### Pull
 - git pull
 
### List des repositories associés
 - git remote -v

## Commandes Heroku

### Connexion
 - heroku login
 
### Déployer l'application
 - git add .
 - git commit -m "Message"
 - git push heroku master
 
### Ouvrir l'application
 - heroku open
 
### Créer une instance de l'application (1 = on, 0 = off)
 - heroku ps:scale web=1

### Voir l'historique des connexions
 - heroku logs --tail
 
## Commandes npm

### Installer les dépendances dans le dossier node_modules
 - npm install
 
## Commandes yarn
 
### Pour lancer l'application localement
 - yarn build
 - yarn start
 
 L'adresse locale est : http://localhost:8080/
