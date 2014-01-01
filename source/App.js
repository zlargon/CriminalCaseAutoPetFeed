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
  }
});
