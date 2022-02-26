getKaiAd({
  publisher: "4408b6fa-4e1d-438f-af4d-f3be2fa97208",
  app: "feedolin",
  slot: "feedolin",
  test: 0,

  h: 300,
  w: 240,

  // Max supported size is 240x264
  // container is required for responsive ads
  container: document.getElementById("KaiOsAd"),
  onerror: (err) => helper.toaster("Custom catch:", err),
  onready: (ad) => {
    // Ad is ready to be displayed
    // calling 'display' will display the ad
    ad.call("display", {
      // In KaiOS the app developer is responsible
      // for user navigation, and can provide
      // navigational className and/or a tabindex
      tabindex: 0,

      // if the application is using
      // a classname to navigate
      // this classname will be applied
      // to the container
      navClass: "item",

      // display style will be applied
      // to the container block or inline-block
      display: "block",
    });
  },
});
