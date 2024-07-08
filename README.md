# Sunday Service Webb App

Production: https://sunday-service-vr.web.app/

## First time setup

* Download Node/NPM (https://nodejs.org/en/download)
* Download JDK (https://www.oracle.com/java/technologies/downloads/)
* Ensure that you (the dev) have access to sunday-service-vr (Ask Windy if you are missing access)
* Start the app
    * `npm install -g firebase-tools`
    * `cd functions`
    * `npm install`
    * `cd ../webapp`
    * `npm install`
    * `npm run start`
  
At this point, the app will be running on `localhost:3000` and the emulator UI will be (probably) running on `http://127.0.0.1:4000/`

When closing this process, remember to press control-c ONCE.  Doing so twice will do a hard stop where the firebase emulator may not have saved any data.
