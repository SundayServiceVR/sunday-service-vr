export const expectedUk = `Sunday Service
2024-06-09
Host: Strawbs

Lineup: (times BST)
8p Icedog
9p WOLFMAGIC
9:30p DJ Dog DEBUTT
11:30p Skrillex DEBUTT
`;

export const expectedAu = `Sunday Service
2024-06-10
Host: Strawbs

Lineup: (times AEST)
5a Icedog
6a WOLFMAGIC
6:30a DJ Dog DEBUTT
8:30a Skrillex DEBUTT
`;

export const expectedDiscord = `**Sunday Service**

Come by to chill and wiggle to some Sunday Service tunes!

Event start: <t:1717959600:F>

Host: Strawbs

DJs:
<t:1717959600> : Icedog
<t:1717963200> : WOLFMAGIC
<t:1717965000> : DJ Dog (DEBUTT!)
<t:1717972200> : Skrillex (DEBUTT!)

https://discord.s4vr.net/
https://twitch.s4vr.net/
`;

export const expectedSocialMedia = `Sunday Service
2024-06-09
Host: Strawbs

Lineup: (times BST)
8p - Icedog
9p - WOLFMAGIC
9:30p - DJ Dog - DEBUTT
11:30p - Skrillex - DEBUTT

https://twitch.s4vr.net/
`;

export const testEvent = {
  "name": "Sunday Service",
  "start_datetime": new Date("2024-06-09T19:00:00.000Z"),
  "end_datetime": new Date("2024-06-09T23:30:00.000Z"),
  "host": "Strawbs",
  "message": "Come by to chill and wiggle to some Sunday Service tunes!",
  "slots": [
    {
      "dj_ref": {
        "converter": null,
        "_key": {
          "path": {
            "segments": [
              "projects",
              "sunday-service-vr",
              "databases",
              "(default)",
              "documents",
              "djs",
              "kjyBd5Wiv7aV1soD9jGb"
            ],
            "offset": 5,
            "len": 2
          }
        },
        "type": "document",
        "firestore": {
          "app": {
            "_isDeleted": false,
            "_options": {
              "apiKey": "AIzaSyDLiHWGv608qbGNVOoGpWog9hljNpCFsNw",
              "authDomain": "sunday-service-vr.firebaseapp.com",
              "projectId": "sunday-service-vr",
              "storageBucket": "sunday-service-vr.appspot.com",
              "messagingSenderId": "610955197411",
              "appId": "1:610955197411:web:176a1ec89d1be7d9417ed6",
              "measurementId": "G-ESYWL7W398"
            },
            "_config": {
              "name": "[DEFAULT]",
              "automaticDataCollectionEnabled": false
            },
            "_name": "[DEFAULT]",
            "_automaticDataCollectionEnabled": false,
            "_container": {
              "name": "[DEFAULT]",
              "providers": {}
            }
          },
          "databaseId": {
            "projectId": "sunday-service-vr",
            "database": "(default)"
          },
          "settings": {
            "host": "127.0.0.1:8080",
            "ssl": false,
            "ignoreUndefinedProperties": false,
            "cacheSizeBytes": 41943040,
            "experimentalForceLongPolling": false,
            "experimentalAutoDetectLongPolling": true,
            "experimentalLongPollingOptions": {},
            "useFetchStreams": true
          }
        }
      },
      "dj_name": "Icedog",
      "rtmp_url": "rtspt://stream.vrcdn.live/live/frostyteststream",
      "twitch_username": "",
      "prerecord_url": "",
      "duration": 1,
      "is_debut": false,
      "start_time": new Date("2024-06-09T19:00:00.000Z"),
      "slot_type": "RTMP"
    },
    {
      "dj_ref": {
        "converter": null,
        "_key": {
          "path": {
            "segments": [
              "projects",
              "sunday-service-vr",
              "databases",
              "(default)",
              "documents",
              "djs",
              "7LDJdHZOsfnZP3bqkC03"
            ],
            "offset": 5,
            "len": 2
          }
        },
        "type": "document",
        "firestore": {
          "app": {
            "_isDeleted": false,
            "_options": {
              "apiKey": "AIzaSyDLiHWGv608qbGNVOoGpWog9hljNpCFsNw",
              "authDomain": "sunday-service-vr.firebaseapp.com",
              "projectId": "sunday-service-vr",
              "storageBucket": "sunday-service-vr.appspot.com",
              "messagingSenderId": "610955197411",
              "appId": "1:610955197411:web:176a1ec89d1be7d9417ed6",
              "measurementId": "G-ESYWL7W398"
            },
            "_config": {
              "name": "[DEFAULT]",
              "automaticDataCollectionEnabled": false
            },
            "_name": "[DEFAULT]",
            "_automaticDataCollectionEnabled": false,
            "_container": {
              "name": "[DEFAULT]",
              "providers": {}
            }
          },
          "databaseId": {
            "projectId": "sunday-service-vr",
            "database": "(default)"
          },
          "settings": {
            "host": "127.0.0.1:8080",
            "ssl": false,
            "ignoreUndefinedProperties": false,
            "cacheSizeBytes": 41943040,
            "experimentalForceLongPolling": false,
            "experimentalAutoDetectLongPolling": true,
            "experimentalLongPollingOptions": {},
            "useFetchStreams": true
          }
        }
      },
      "dj_name": "WOLFMAGIC",
      "rtmp_url": "rtspt://stream.vrcdn.live/live/wolfmagic",
      "twitch_username": "",
      "prerecord_url": "",
      "duration": 0.5,
      "is_debut": false,
      "start_time": new Date("2024-06-09T20:00:00.000Z"),
      "slot_type": "PRERECORD"
    },
    {
      "dj_ref": {
        "converter": null,
        "_key": {
          "path": {
            "segments": [
              "projects",
              "sunday-service-vr",
              "databases",
              "(default)",
              "documents",
              "djs",
              "2EbWoV8VDr0AHyhAeog0"
            ],
            "offset": 5,
            "len": 2
          }
        },
        "type": "document",
        "firestore": {
          "app": {
            "_isDeleted": false,
            "_options": {
              "apiKey": "AIzaSyDLiHWGv608qbGNVOoGpWog9hljNpCFsNw",
              "authDomain": "sunday-service-vr.firebaseapp.com",
              "projectId": "sunday-service-vr",
              "storageBucket": "sunday-service-vr.appspot.com",
              "messagingSenderId": "610955197411",
              "appId": "1:610955197411:web:176a1ec89d1be7d9417ed6",
              "measurementId": "G-ESYWL7W398"
            },
            "_config": {
              "name": "[DEFAULT]",
              "automaticDataCollectionEnabled": false
            },
            "_name": "[DEFAULT]",
            "_automaticDataCollectionEnabled": false,
            "_container": {
              "name": "[DEFAULT]",
              "providers": {}
            }
          },
          "databaseId": {
            "projectId": "sunday-service-vr",
            "database": "(default)"
          },
          "settings": {
            "host": "127.0.0.1:8080",
            "ssl": false,
            "ignoreUndefinedProperties": false,
            "cacheSizeBytes": 41943040,
            "experimentalForceLongPolling": false,
            "experimentalAutoDetectLongPolling": true,
            "experimentalLongPollingOptions": {},
            "useFetchStreams": true
          }
        }
      },
      "dj_name": "DJ Dog",
      "rtmp_url": "rtspt://stream.vrcdn.live/live/dj_dog",
      "twitch_username": "",
      "prerecord_url": "",
      "duration": 2,
      "is_debut": true,
      "start_time": new Date("2024-06-09T20:30:00.000Z"),
      "slot_type": "PRERECORD"
    },
    {
      "dj_ref": {
        "converter": null,
        "_key": {
          "path": {
            "segments": [
              "projects",
              "sunday-service-vr",
              "databases",
              "(default)",
              "documents",
              "djs",
              "nMPeezbGX21Xh3OIvsod"
            ],
            "offset": 5,
            "len": 2
          }
        },
        "type": "document",
        "firestore": {
          "app": {
            "_isDeleted": false,
            "_options": {
              "apiKey": "AIzaSyDLiHWGv608qbGNVOoGpWog9hljNpCFsNw",
              "authDomain": "sunday-service-vr.firebaseapp.com",
              "projectId": "sunday-service-vr",
              "storageBucket": "sunday-service-vr.appspot.com",
              "messagingSenderId": "610955197411",
              "appId": "1:610955197411:web:176a1ec89d1be7d9417ed6",
              "measurementId": "G-ESYWL7W398"
            },
            "_config": {
              "name": "[DEFAULT]",
              "automaticDataCollectionEnabled": false
            },
            "_name": "[DEFAULT]",
            "_automaticDataCollectionEnabled": false,
            "_container": {
              "name": "[DEFAULT]",
              "providers": {}
            }
          },
          "databaseId": {
            "projectId": "sunday-service-vr",
            "database": "(default)"
          },
          "settings": {
            "host": "127.0.0.1:8080",
            "ssl": false,
            "ignoreUndefinedProperties": false,
            "cacheSizeBytes": 41943040,
            "experimentalForceLongPolling": false,
            "experimentalAutoDetectLongPolling": true,
            "experimentalLongPollingOptions": {},
            "useFetchStreams": true
          }
        }
      },
      "dj_name": "Skrillex",
      "rtmp_url": "twitch.tv/skrillex",
      "twitch_username": "skrillex",
      "prerecord_url": "",
      "duration": 1,
      "is_debut": true,
      "start_time": new Date("2024-06-09T22:30:00.000Z"),
      "slot_type": "TWITCH"
    }
  ],
  "footer": "https://discord.s4vr.net/\nhttps://twitch.s4vr.net/",
  "id": "IWC2a9vuv773ZAGggKfp"
}