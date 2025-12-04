function disableScroll() {
  document.body.style.overflow = "hidden";
  document.body.style.height = "100%";

  document.addEventListener("wheel", preventScroll, { passive: false });
  document.addEventListener("touchmove", preventScroll, { passive: false });
  document.addEventListener("keydown", preventScrollKeys);
}

function enableScroll() {
  document.body.style.overflow = "";
  document.body.style.height = "";

  document.removeEventListener("wheel", preventScroll);
  document.removeEventListener("touchmove", preventScroll);
  document.removeEventListener("keydown", preventScrollKeys);
}

function preventScroll(e) {
  e.preventDefault();
}

function preventScrollKeys(e) {
  const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
  if (scrollKeys.includes(e.keyCode)) {
    e.preventDefault();
  }
}

disableScroll();
