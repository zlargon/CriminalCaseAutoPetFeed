enyo.kind({
  name: "App",

  components: [
    { tag: "h2", content: "Criminal Case Auto Pet Feed" }
  ],

  // get user info by user name or id
  getUserInfoByUserNameOrId: function(userNameOrId, successCallbackWithUserInfo, failureCallbackWithMessage) {
    var win = typeof successCallbackWithUserInfo === "function" ? successCallbackWithUserInfo : function() {},
        fail = typeof failureCallbackWithMessage === "function" ? failureCallbackWithMessage : function() {};

    if (typeof userNameOrId !== "string") {
      fail("parameters type error");
      return;
    }

    // ajax
    new enyo.Ajax({
      url: "https://graph.facebook.com/" + userNameOrId,
      contentType: 'application/json',
      cacheBust: false
    })

    // response handler
    .response(function(inSender, inResponse) {

      /* get User Info Success:
       *
       * {
       *   "id": "100000373458757",
       *   "name": "\u9ec3\u4fca\u9686",
       *   "first_name": "\u4fca\u9686",
       *   "last_name": "\u9ec3",
       *   "link": "http://www.facebook.com/zlargon.huang",
       *   "username": "zlargon.huang",
       *   "gender": "male",
       *   "locale": "zh_TW"
       * }
       *
       */

      if (typeof inResponse            !== "object" ||
          typeof inResponse.id         !== "string" ||
          typeof inResponse.name       !== "string" ||
          typeof inResponse.first_name !== "string" ||
          typeof inResponse.last_name  !== "string" ||
          typeof inResponse.link       !== "string" ||
          typeof inResponse.username   !== "string" ||
          typeof inResponse.gender     !== "string" ||
          typeof inResponse.locale     !== "string") {
        fail("server return unexpected response");
        return;
      }

      // success
      win(inResponse);
    })

    // error handler
    .error(function(inSender, inResponse) {

      switch(inResponse) {
        case 0:
          fail("connect error");
          break;

        case 404:
          try {
            /* get User Info Failed:
             *
             * {
             *   "error": {
             *     "message": "(#803) Some of the aliases you requested do not exist: zlargon.huanga",
             *     "type": "OAuthException",
             *     "code": 803
             *   }
             * }
             */
            fail(JSON.parse(inSender.xhrResponse.body).error.message);
          } catch(e) {
            fail("server return unexpected response " + inResponse);
          }
          break;

        default:
          fail("unknown error");
          break;
      }
    })

    // start ajax
    .go();
  },

  // feed pet
  feedPet: function(userId, petId, onSuccessCallback, onFailureCallbackWithMessage, onReceivedPetListCallback) {
    var win = typeof onSuccessCallback === "function" ? onSuccessCallback : function() {},
        fail = typeof onFailureCallbackWithMessage === "function" ? onFailureCallbackWithMessage : function() {},
        cb = typeof onReceivedPetListCallback === "function" ? onReceivedPetListCallback : function() {};

    if (typeof userId !== "string" ||
        typeof petId  !== "number") {
      fail("parameters type error");
      return;
    }

    // JSONP post
    FlyJSONP.post({
      url: "https://imabigfanof.criminalcasegame.com/bridge.php",

      parameters: {
        query: encodeURIComponent(JSON.stringify({
          "id": 9,
          "action": "feedPet",
          "params": {
            "user": userId,
            "foods": [
              { "pet": petId, "food": 1 }
            ],
            "revision": 43
          }
        }))
      },

      // JSONP success
      success: function(inResponse) {

        /*  success json format
         *
         *  { "id": 9,
         *    "response": [],
         *    "ts": 1388837457
         *  }
         *
         */

        if (typeof inResponse.error === "undefined") {
          win();
          return;
        }

        // check error
        if (typeof inResponse.error      !== "object" ||
            typeof inResponse.error.type !== "string") {
          fail("server return unexpected response " + JSON.stringify(inResponse));
          return;
        }

        /*  failure json format
         *
         *  {
         *    "error": {
         *      "type": "pet",
         *      "code": "PET",
         *      "sync": {
         *        "cash": 0,
         *        "coins": 164231,
         *        "pets": {
         *          "equipped": 1,
         *          "adopted": {
         *            "1": { "level": 5, "loyalty": 0,   "cooldown": 0,  "food_id": 3 },
         *            "2": { "level": 5, "loyalty": 0,   "cooldown": 0,  "food_id": 1 },
         *            "4": { "level": 2, "loyalty": 159, "cooldown": 68, "food_id": 1 },
         *            "5": { "level": 2, "loyalty": 134, "cooldown": 68, "food_id": 1 }
         *          }
         *        }
         *      },
         *      "cash": 0,
         *      "coins": 164231,
         *      "pets": {
         *        "equipped": 1,
         *        "adopted": {
         *          "1": { "level": 5, "loyalty": 0,   "cooldown": 0,  "food_id": 3 },
         *          "2": { "level": 5, "loyalty": 0,   "cooldown": 0,  "food_id": 1 },
         *          "4": { "level": 2, "loyalty": 159, "cooldown": 68, "food_id": 1 },
         *          "5": { "level": 2, "loyalty": 134, "cooldown": 68, "food_id": 1 }
         *        }
         *      }
         *    }
         *  }
         *
         */

        switch(inResponse.error.type) {
          // pet
          case "pet":
            if (typeof inResponse.error.pets         === "object" &&
                typeof inResponse.error.pets.adopted === "object") {

              /*  inResponse.error.pets.adopted format
               *
               *  {
               *    "1": { "level": 5, "loyalty": 0,   "cooldown": 0,  "food_id": 3 },
               *    "2": { "level": 5, "loyalty": 0,   "cooldown": 0,  "food_id": 1 },
               *    "4": { "level": 2, "loyalty": 159, "cooldown": 68, "food_id": 1 },
               *    "5": { "level": 2, "loyalty": 134, "cooldown": 68, "food_id": 1 }
               *  }
               *
               */

              var petList = [];
              $.each(inResponse.error.pets.adopted, function(key, petItem) {
                petItem.id = parseInt(key);
                petList.push(petItem);
              });

              /*  petList format
               *
               *  [
               *    { "id": 1, "level": 5, "loyalty": 0,   "cooldown": 0,  "food_id": 3 },
               *    { "id": 2, "level": 5, "loyalty": 0,   "cooldown": 0,  "food_id": 1 },
               *    { "id": 4, "level": 3, "loyalty": 159, "cooldown": 68, "food_id": 1 },
               *    { "id": 5, "level": 2, "loyalty": 134, "cooldown": 68, "food_id": 1 }
               *  ]
               */

              cb(petList);
            }

            // check error code
            if (typeof inResponse.error.code !== "string") {
              fail("server return unexpected response " + JSON.stringify(inResponse));
              return;
            }

            fail("err_" + inResponse.error.code.toLowerCase());  // return 'pet' or 'cooldown'
            return;

          // other
          // case "revision":
          // case "refresh":
          default:
            fail("err_" + inResponse.error.type);  // return 'revision', 'refresh' or others
        }
      },

      // JSONP error
      error: function(errorMessage) {
        fail("JSONP: " + errorMessage);
      }
    });
  }
});
