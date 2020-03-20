# Pictionary

L'adresse de l'application est : https://clerc-dejaham-pictionary.herokuapp.com/

## Pré-requis

### Installation de nodejs et npm :
 - curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
 - sudo apt install nodejs
 
### Installation d'Heroku :
 - curl https://cli-assets.heroku.com/install.sh | sh

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

### Connection
 - heroku login
 
### Déployer l'application
 - git add .
 - git commit -m "Message"
 - git push heroku master
 
### Ouvrir l'application
 - heroku open
 
### Créer une instance de l'application (1 = on, 0 = off)
 - heroku ps:scale web=1

### Voir l'historique des connections
 - heroku logs --tail
 
### Pour lancer l'application localement
 - npm install
 - heroku local web
 
 L'adresse locale est : http://localhost:5000/
