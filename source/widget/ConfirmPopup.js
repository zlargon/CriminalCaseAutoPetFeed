enyo.kind({
  name: "ConfirmPopup",
  classes: "confirm-popup",
  kind: "onyx.Popup",
  published: {
    mainText: "",
    leftButtonText: "OK",
    rightButtonText: null
  },
  centered: true,
  scrim: true,
  modal: true,
  floating: true,
  components: [
    { name: "mainText",
      classes: "main-text",
      tag: "p",
      allowHtml: true
    },

    { style: "text-align: center;",
      components: [
      { kind: "onyx.Button",
        classes: "left-button",
        name: "leftButton",
        ontap: "leftCallback"
      },

      { kind: "onyx.Button",
        classes: "right-button",
        name: "rightButton",
        ontap: "rightCallback"
      }
    ]}
  ],

  create: function() {
    this.inherited(arguments);
    this.mainTextChanged();
    this.leftButtonTextChanged();
    this.rightButtonTextChanged();
  },

  mainTextChanged: function(oldValue) {
    this.$.mainText.setContent(this.mainText);
  },

  leftButtonTextChanged: function(oldValue) {
    this.$.leftButton.addRemoveClass("hide", this.leftButtonText == null);
    this.$.leftButton.setContent(this.leftButtonText);
  },

  rightButtonTextChanged: function(oldValue) {
    this.$.rightButton.addRemoveClass("hide", this.rightButtonText == null);
    this.$.rightButton.setContent(this.rightButtonText);
  },

  leftCallback: function(inSender, inEvent) {
    this.hide();
    return true;
  },

  rightCallback: function(inSender, inEvent) {
    this.hide();
    return true;
  },

  setButtonCallback: function(leftCallback, rightCallback) {

    var defaultCallback = function(inSender, inEvent) {
      this.hide();
      return true;
    };

    this.leftCallback = (typeof leftCallback == "function") ? leftCallback : defaultCallback;
    this.rightCallback = (typeof rightCallback == "function") ? rightCallback : defaultCallback;
  }
});
