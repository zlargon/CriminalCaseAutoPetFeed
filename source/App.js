enyo.kind({
  name: "App",
  kind: "FittableRows",
  classes: "app",

  userId: "",
  petList: [],

  REVISION: 43,
  PET_NAME: [
    "German Shepherd",       // 0
    "Cavalier King Charles", // 1
    "Labrador Retriever",    // 2
    "Boxer",                 // 3
    "Akita",                 // 4
    "Pug",                   // 5
    "Chihuahua",             // 6
    "Collie",                // 7
    "Dalmatian",             // 8
    "Jack Russell Terrier",  // 9
    "St. Bernard",           // 10
    "Husky",                 // 11
    "Tiger",                 // 12
    "Panda",                 // 13
    "Robot Dog"              // 14
  ],
  PET_FOOD: {
    cookie:  1,  // loyalty:  +1, cooldown:  5 min
    fish:    2,  // loyalty:  +5, cooldown:  4 hr
    chicken: 3   // loyalty: +10, cooldown: 12 hr
  },
  PET_MAX_LOYALTY: function(petId, petLevel) {
    var coefficient = [1, 4, 12, 24, 0];
    return (20 + Math.ceil(petId / 3) * 10) * coefficient[petLevel - 1];
  },

  components: [
    // Toolbar
    { kind: "onyx.Toolbar",
      layoutKind: "FittableColumnsLayout",
      components: [
        // Header
        { name: "toolbarHeader",
          fit: true,
          content: "pets"
        },

        // Setting Button
        { kind: "onyx.Button",
          ontap: "showUserPopup",
          components: [
            { kind: "Image", src: "assets/setting_icon.png" }
        ]}
    ]},

    // Pet List
    { name: "list",
      kind: "List",
      fit: true,
      onSetupItem: "setupItem",

      // pet item template
      components: [
        { name: "petItem",
          classes: "pet-item",
          components: [
            // icon
            { name: "petIcon", kind: "Image" },

            // info
            { classes: "info",
              components: [
                { name: "petLevel" },
                { name: "petLoyalty" },
                { name: "petCooldown" }
            ]}
        ]}
    ]},

    // input facebook user name or id
    { name: "userPopup",
      kind: "onyx.Popup",
      classes: "app-popup",
      onkeyup: "keyupEventHandler",
      scrim: true,
      centered: true,
      modal: true,
      floating: true,
      components: [
        { classes: "title",
          content: "Please input facebook user name or id"
        },
        { kind: "onyx.InputDecorator",
          classes: "text",
          components: [
            { name: "inputUserName",
              kind: "onyx.Input",
              selectOnFocus: true,
              placeholder: "user name or id"
            }
        ]},
        { tag: "br" },
        { kind: "onyx.Button", content: "OK", ontap: "startToGetUserIdFromFacebook" }
    ]},

    // Alert Popup
    { name: "alert",
      kind: "onyx.Popup",
      classes: "app-popup",
      onkeyup: "keyupEventHandler",
      scrim: true,
      centered: true,
      modal: true,
      floating: true,
      components: [
        { name: "alertMessage", classes: "title" },
        { tag: "br" },
        { kind: "onyx.Button", content: "OK", ontap: "alert" }
    ]},

    // BlockUI
    { name: "blockUI",
      kind: "onyx.Popup",
      floating: true,
      centered: true,
      scrim: true,
      autoDismiss: false,
      style: "padding: 30px; text-align: center;",
      components: [
        { kind: "onyx.Spinner" },
        { name: "blockUIMessage", content: "loading..." }
    ]}
  ],

  rendered: function() {
    this.inherited(arguments);

    var userName = localStorage.getItem("App.userName");

    if (userName !== null) {
      this.$.inputUserName.setValue(userName);
      this.startToGetUserIdFromFacebook();
    }
  },

  blockUI: function(message) {
    this.$.blockUI.hide();

    if (enyo.isString(message)) {
      this.$.blockUIMessage.setContent(message);
      this.$.blockUI.show();
    }
  },

  alert: function(message) {
    this.$.alert.hide();

    if (enyo.isString(message)) {
      this.$.alertMessage.setContent(message);
      this.$.alert.show();
    }
  },

  showUserPopup: function() {
    this.$.userPopup.show();
    this.$.inputUserName.focus();
    return true;
  },

  keyupEventHandler: function(inSender, inEvent) {

    // Enter
    if (inEvent.keyCode !== 13) {
      return true;
    }

    switch(inSender.name) {

      case "userPopup":
        this.startToGetUserIdFromFacebook();
        break;

      case "alert":
        inSender.hide();
        break;
    }

    return true;
  },

  startToGetUserIdFromFacebook: function() {
    this.timerStop();

    var userName = this.$.inputUserName.getValue();
    if (userName === "") {
      this.alert("please set the user name or id");
      return;
    }

    this.blockUI("loading...");

    this.getUserInfoByUserNameOrId(
      userName,

      // success
      enyo.bind(this, function(userInfo) {
        localStorage.setItem("App.userName", userName);

        this.$.toolbarHeader.setContent(userInfo.name + "'s pets");
        this.userId = userInfo.id;

        this.$.userPopup.hide();
        this.blockUI("fetch pet list...");

        this.getPetListAndRefreshUI();
      }),

      // failure
      enyo.bind(this, function(errorMessage) {
        this.blockUI(null);
        this.alert(errorMessage);
      })
    );

    return true;
  },

  setupItem: function(inSender, inEvent) {
    var pet = this.petList[inEvent.index];

    this.$.petIcon.setSrc("assets/pets/" + this.PET_NAME[pet.id - 1] + ".jpg");
    this.$.petLevel.setContent("Level: " + pet.level);
    this.$.petLoyalty.setContent("Loyalty: " + pet.loyalty + "/" + this.PET_MAX_LOYALTY(pet.id, pet.level));
    this.$.petCooldown.setContent("Cooldown: " + this.timerFormat(pet.cooldown));
  },

  refreshList: function() {
    this.$.list.setCount(this.petList.length);
    this.$.list.render();
  },

  getPetListAndRefreshUI: function() {
    // get pet list
    this.getPetList(
      this.userId,

      // success
      enyo.bind(this, function(petList) {
        this.petList = petList;
        this.refreshList();
        this.timerStart();
        this.blockUI(null);
      }),

      // failure
      enyo.bind(this, function(errorMessage) {
        this.blockUI(null);
        this.petList = [];
        this.refreshList();
        this.alert(errorMessage);
    }));
  },

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

      if (typeof inResponse      !== "object" ||
          typeof inResponse.id   !== "string" ||
          typeof inResponse.name !== "string") {
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
  feedPet: function(userId, petId, petFood, onSuccessCallback, onFailureCallbackWithMessageAndPetList) {

    if (typeof userId  !== "string" ||
        typeof petId   !== "number" ||
        typeof petFood !== "number") {
      fail("parameters type error");
      return;
    }

    var win = enyo.isFunction(onSuccessCallback) ? onSuccessCallback : function() {},
        fail = enyo.isFunction(onFailureCallbackWithMessageAndPetList) ? onFailureCallbackWithMessageAndPetList : function() {};

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
              { "pet": petId, "food": petFood }
            ],
            "revision": this.REVISION
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

              fail("err_" + inResponse.error.code.toLowerCase(), petList); // return 'pet' or 'cooldown'
              return;
            }

          // other
          // case "revision":
          // case "refresh":
          default:
            fail("err_" + inResponse.error.type); // return 'pet', 'revision', 'refresh' or others
        }
      },

      // JSONP error
      error: function(errorMessage) {
        fail("JSONP: " + errorMessage);
      }
    });
  },

  getPetList: function(userId, onSuccessWithPetList, onFailureWithMessage) {

    var win = enyo.isFunction(onSuccessWithPetList) ? onSuccessWithPetList : function() {},
        fail = enyo.isFunction(onFailureWithMessage) ? onFailureWithMessage : function() {},
        fn = enyo.bind(this, function(petId) {
          this.feedPet(
            userId,
            petId,
            this.PET_FOOD.cookie,

            // feed success
            function() {
              // feed success, but couldn't get the pet list from here
              // try to feed it again to make it occur error
              fn(petId);
            },

            // feed failure
            function(errorMessage, petList) {

              if (Array.isArray(petList)) {
                win(petList);
                return;
              }

              fail("fetch pet list failure: " + errorMessage);
          });
        });

    // start get pet list
    fn(15);
  },

  feedPetByList: function(userId, petList, onComplete) {

    var complete = (function() {
      var counter = 0;

      return function() {
        counter++;

        if (counter === petList.length) {

          if (enyo.isFunction(onComplete)) {
            onComplete();
          }
        }
      }
    })();

    $.each(petList, (function(index, pet) {

      if (pet.level === 5) {
        console.log("feed pet " + this.PET_NAME[pet.id - 1] + "(" + pet.id + ") failure: max level");
        complete();
        return;
      }

      this.feedPet(
        userId,
        pet.id,

        // feed food chicken (loyalty +10) at last time to max level 5
        (pet.level === 4 && this.PET_MAX_LOYALTY(pet.id, pet.level) - pet.loyalty <= 10) ? this.PET_FOOD.chicken : this.PET_FOOD.cookie,

        // feed success
        enyo.bind(this, function() {
          console.log("feed pet " + this.PET_NAME[pet.id - 1] + "(" + pet.id + ") success");
          complete();
        }),

        // feed failure
        enyo.bind(this, function(errorMessage) {
          console.log("feed pet " + this.PET_NAME[pet.id - 1] + "(" + pet.id + ") failure: " + errorMessage);
          complete();
      }));

    }).bind(this));
  },

  // timer
  timerId: -1,
  timerFormat: function(second) {
    if (second < 0) {
      return "00:00:00";
    }

    var sec = second % 60,
        min = Math.floor(second / 60 % 60),
        hr  = Math.floor(second / 60 / 60);

    return enyo.format("%s:%s:%s", hr, min, sec).replace(/\b(\d)\b/g, "0$1");
  },
  timerStop: function() {
    clearInterval(this.timerId);
  },
  timerStart: function() {
    this.timerStop();
    this.timerId = setInterval((function() {

      for (var i = 0; i < this.petList.length; i++) {

        // 1. check level
        if (this.petList[i].level === 5) {
          continue;
        }

        // 2. decrease cooldown
        this.petList[i].cooldown--;
        if (this.petList[i].cooldown > 0) {
          this.$.list.renderRow(i);
          continue;
        }

        // cooldown is done, feed pets
        this.timerStop();
        this.blockUI("feeding pets...");

        // 3. feed pets
        this.feedPetByList(
          this.userId,
          this.petList,

          // complete
          enyo.bind(this, function() {
            this.blockUI("update pet list...");
            this.getPetListAndRefreshUI();
        }));
        break;

      } /* end of for loop */

    }).bind(this), 1000);
  }
});
