/* PPAF gallery: filtering and accessible lightbox */
(function () {
  "use strict";

  var filterButtons = Array.from(document.querySelectorAll(".gallery-filter"));
  var stories = Array.from(document.querySelectorAll(".gallery-story"));
  var count = document.getElementById("gallery-count");

  function visiblePhotos() {
    return Array.from(document.querySelectorAll(".gallery-story:not([hidden]) [data-lightbox]"));
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.dataset.filter;
      filterButtons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      stories.forEach(function (story) {
        var show = filter === "all" || story.dataset.category.split(" ").includes(filter);
        story.hidden = !show;
        if (show) story.classList.add("is-visible");
      });

      var total = visiblePhotos().length;
      if (count) count.textContent = total + (total === 1 ? " photograph" : " photographs");
    });
  });

  var dialog = document.getElementById("gallery-lightbox");
  if (!dialog) return;

  var image = dialog.querySelector("img");
  var caption = dialog.querySelector("figcaption");
  var closeButton = dialog.querySelector(".gallery-lightbox__close");
  var previousButton = dialog.querySelector(".gallery-lightbox__nav--prev");
  var nextButton = dialog.querySelector(".gallery-lightbox__nav--next");
  var currentIndex = 0;

  function showPhoto(index) {
    var photos = visiblePhotos();
    if (!photos.length) return;
    currentIndex = (index + photos.length) % photos.length;
    var source = photos[currentIndex].querySelector("img");
    image.src = source.currentSrc || source.src;
    image.alt = source.alt;
    caption.textContent = photos[currentIndex].dataset.caption || source.alt;
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-lightbox]");
    if (!trigger || trigger.closest("[hidden]")) return;
    var photos = visiblePhotos();
    showPhoto(photos.indexOf(trigger));
    dialog.showModal();
    document.body.classList.add("lightbox-open");
  });

  function closeDialog() {
    dialog.close();
    document.body.classList.remove("lightbox-open");
  }

  closeButton.addEventListener("click", closeDialog);
  previousButton.addEventListener("click", function () { showPhoto(currentIndex - 1); });
  nextButton.addEventListener("click", function () { showPhoto(currentIndex + 1); });

  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener("close", function () {
    document.body.classList.remove("lightbox-open");
  });
  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") showPhoto(currentIndex - 1);
    if (event.key === "ArrowRight") showPhoto(currentIndex + 1);
  });
})();
