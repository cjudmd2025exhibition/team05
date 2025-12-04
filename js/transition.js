document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".page-transition-overlay");

  if (overlay) {
    setTimeout(() => {
      overlay.style.opacity = "0";
    }, 100);

    document.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        const url = link.getAttribute("href");
        if (!url || url.startsWith("#")) return;

        e.preventDefault();
        navigateWithTransition(url);
      });
    });
  }
});

function navigateWithTransition(url) {
  const overlay = document.querySelector(".page-transition-overlay");

  if (overlay) {
    overlay.style.opacity = "1";
    setTimeout(() => {
      window.location.href = url;
    }, 500);
  } else {
    window.location.href = url;
  }
}

window.navigateWithTransition = navigateWithTransition;
