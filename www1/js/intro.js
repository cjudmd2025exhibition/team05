const portalAnchor = document.querySelector(".portal-anchor");
const portalGhost = document.querySelector(".portal-ghost");
const emptySection = document.querySelector(".empty");
const portalContainer = document.querySelector(".portal");
const portalLine = document.querySelector(".portal-line");
const introBg = document.querySelector(".intro-bg");
const portalRingOuter = document.querySelector(".portal-ring-outer");
const portalRingInner = document.querySelector(".portal-ring-inner");

const LINE_BASE = 252;
const MAX_DRAG = 300;

const dragState = {
  active: false,
  startY: 0,
  startOffset: 0,
  current: 0,
  pointerId: null,
  completed: false,
};

function setDragOffset(value) {
  const clamped = Math.max(0, Math.min(MAX_DRAG, value));
  dragState.current = clamped;

  portalContainer.style.setProperty("--drag-offset", `${clamped}px`);

  const lineFill = Math.max(0, LINE_BASE - clamped);
  portalContainer.style.setProperty("--line-fill", `${lineFill}px`);

  const scale = getScaleTarget();
  portalAnchor.style.transform = `translate(-50%, 0) translateY(${clamped}px) scale(${scale})`;

  const bgProgress = clamped / MAX_DRAG;
  const bgMove = bgProgress * 200;
  introBg.style.transform = `translateY(-${bgMove}px)`;
}

function getScaleTarget() {
  if (portalAnchor.classList.contains("is-pressed")) return 0.5;
  if (portalAnchor.classList.contains("is-hover")) return 0.9;
  return 1;
}

function checkCollision() {
  if (dragState.completed) return false;

  const ringRect = portalRingOuter.getBoundingClientRect();
  const ghostRect = portalGhost.getBoundingClientRect();

  const isFullyOverlapping =
    ringRect.top >= ghostRect.top &&
    ringRect.bottom <= ghostRect.bottom &&
    ringRect.left >= ghostRect.left &&
    ringRect.right <= ghostRect.right;

  return isFullyOverlapping;
}

// 🔊 페이지 트랜지션 시작 효과음
const cloudSound = new Audio("../../sound/cloud.mp3");

function triggerScroll() {
  if (dragState.completed) return;

  dragState.completed = true;
  dragState.active = false;

  // 페이지 트랜지션 시작 시 cloud 소리 재생
  cloudSound.currentTime = 0;
  cloudSound.play().catch((err) => {
    console.warn("페이지 트랜지션 시작 효과음 재생 실패:", err);
  });

  portalAnchor.style.cursor = "default";

  portalAnchor.removeEventListener("pointerdown", handlePointerDown);
  portalAnchor.removeEventListener("pointerenter", handlePointerEnter);
  portalAnchor.removeEventListener("pointerleave", handlePointerLeave);

  const emptyPosition = emptySection.offsetTop;

  gsap.to(window, {
    duration: 1.2,
    scrollTo: emptyPosition,
    ease: "power3.inOut",
    onComplete: () => {
      if (window.navigateWithTransition) {
        window.navigateWithTransition("../www2/hell-1.html");
      } else {
        window.location.href = "../www2/hell-1.html";
      }
    },
  });
}

// 🔊 드래그 시작 효과음
const dragStartSound = new Audio("../../sound/cloud-sound.mp3");
let dragSoundPlayed = false;

function handlePointerDown(event) {
  if (dragState.completed) return;

  event.preventDefault();
  
  // 드래그 시작 효과음 재생 (한 번만)
  if (!dragSoundPlayed) {
    dragStartSound.currentTime = 0;
    dragStartSound.play().catch((err) => {
      console.warn("드래그 시작 효과음 재생 실패:", err);
    });
    dragSoundPlayed = true;
  }
  
  dragState.active = true;
  dragState.startY = event.clientY;
  dragState.startOffset = dragState.current;
  dragState.pointerId = event.pointerId;

  portalAnchor.setPointerCapture(event.pointerId);
  portalAnchor.classList.remove("is-hover");
  portalAnchor.classList.add("is-pressed");
  portalAnchor.style.cursor = "grabbing";

  setDragOffset(dragState.startOffset);
}

function handlePointerMove(event) {
  if (!dragState.active || dragState.completed) return;

  const delta = event.clientY - dragState.startY;
  const newOffset = dragState.startOffset + delta;

  setDragOffset(newOffset);

  if (checkCollision()) {
    triggerScroll();
  }
}

function handlePointerEnd() {
  if (!dragState.active) return;

  if (dragState.pointerId !== null) {
    try {
      portalAnchor.releasePointerCapture(dragState.pointerId);
    } catch (e) {}
  }

  if (dragState.completed) return;

  if (checkCollision()) {
    triggerScroll();
    return;
  }

  dragState.active = false;
  dragState.pointerId = null;
  portalAnchor.classList.remove("is-pressed");
  portalAnchor.style.cursor = "grab";

  const startOffset = dragState.current;

  gsap.to(
    { value: startOffset },
    {
      value: 0,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: function () {
        const currentValue = this.targets()[0].value;
        setDragOffset(currentValue);
      },
    }
  );

  if (portalAnchor.matches(":hover")) {
    portalAnchor.classList.add("is-hover");
  }
}

function handlePointerEnter() {
  if (dragState.completed || dragState.active) return;
  portalAnchor.classList.add("is-hover");
  setDragOffset(dragState.current);
}

function handlePointerLeave() {
  if (dragState.completed || dragState.active) return;
  portalAnchor.classList.remove("is-hover");
  setDragOffset(dragState.current);
}

portalAnchor.addEventListener("pointerdown", handlePointerDown);
portalAnchor.addEventListener("pointermove", handlePointerMove);
portalAnchor.addEventListener("pointerup", handlePointerEnd);
portalAnchor.addEventListener("pointercancel", handlePointerEnd);
portalAnchor.addEventListener("pointerenter", handlePointerEnter);
portalAnchor.addEventListener("pointerleave", handlePointerLeave);

setDragOffset(0);
