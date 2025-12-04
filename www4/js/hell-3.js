document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".page-transition-overlay");
  const content01 = document.querySelector(".content01");
  // [추가] UI 헤더 선택
  const uiHeader = document.querySelector(".hell-3-ui-header");
  
  // 🔊 hell-3 전용 배경 사운드 (파도 소리)
  let rogueWaveBgm = null;

  if (overlay && content01) {
    overlay.addEventListener("transitionend", (e) => {
      if (e.propertyName === "opacity" && overlay.style.opacity === "0") {
        overlay.style.pointerEvents = "none";
        const content01Position = content01.offsetTop;

        // [추가] 스크롤 시작 전, UI를 미리 안 보이게(opacity: 0) 설정
        if (uiHeader) {
          gsap.set(uiHeader, { opacity: 0 });
        }

        gsap.to(window, {
          duration: 2.5,
          scrollTo: content01Position,
          ease: "power3.inOut",
          // [추가] 스크롤 애니메이션이 끝난 후(onComplete) 실행
          onComplete: () => {
            if (uiHeader) {
              gsap.to(uiHeader, {
                opacity: 1,
                duration: 1, // 1초 동안 서서히 나타남
                ease: "power2.out",
              });
            }
            // hell-3 안에서만 재생되는 파도 효과음 (무한 반복)
            if (!window.rogueWaveBgm) {
              window.rogueWaveBgm = new Audio("../sound/MP_Rogue Wave 3.mp3");
              window.rogueWaveBgm.loop = true;
              window.rogueWaveBgm.volume = 1.0; // 필요하면 볼륨 조절
            }
            window.rogueWaveBgm.currentTime = 0;
            window.rogueWaveBgm.play().catch((err) => {
              console.warn("hell-3 배경 사운드 재생 실패:", err);
            });
          },
        });
      }
    });
  }

  initHellCursor();
  initModal();
  initFaceShakeOnCamClick();
});

function initHellCursor() {
  const hellCursor = document.querySelector(".hell-cursor");
  const hell1Wrapper = document.querySelector(".hell-3-wrapper");
  const animationTargets = document.querySelectorAll(
    ".hell-3-wrapper, .cam-wrapper, .face-wrapper, .die-wrapper"
  );
  const bottomEmpty = document.querySelector(".bottom-empty");
  const uiElements = document.querySelectorAll(
    ".hell-3-ui-header, .modal-overlay"
  );

  if (!hellCursor || !hell1Wrapper) return;

  uiElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      gsap.to(hellCursor, {
        opacity: 0,
        duration: 0.3,
      });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(hellCursor, {
        opacity: 1,
        duration: 0.3,
      });
    });
  });

  const MAX_DRAG = 150;
  const PARALLAX_RATIO = -0.4;

  let cursorActive = false;
  let cursorDragging = false;
  let scrollTriggered = false;
  let isOverCam = false; // cam 위에 커서가 있는지 추적
  let dragSoundPlayed = false; // 드래그 시작 효과음 재생 여부

  // 🔊 드래그 시작 효과음
  const dragStartSound = new Audio("../sound/cloud-sound.mp3");

  let originX = 0;
  let originY = 0;
  let dragStartY = 0;

  const setCursorPos = (x, y) => {
    hellCursor.style.setProperty("--cursor-x", `${x}px`);
    hellCursor.style.setProperty("--cursor-y", `${y}px`);
  };

  const setCursorOffset = (offset) => {
    hellCursor.style.setProperty("--cursor-offset", `${offset}px`);
  };

  const setLowerScale = (scale) => {
    hellCursor.style.setProperty("--cursor-lower-scale", `${scale}`);
  };

  const enableCursor = () => {
    if (cursorActive) return;
    hellCursor.classList.add("is-active");
    cursorActive = true;
  };

  const disableCursor = () => {
    if (!cursorActive) return;
    hellCursor.classList.remove("is-active");
    hellCursor.classList.remove("is-pressed");
    cursorActive = false;
    hellCursor.style.removeProperty("--cursor-y-initial");
    hellCursor.style.removeProperty("--cursor-x-initial");
  };

  const startPressVisual = () => {
    hellCursor.classList.add("is-pressed");

    gsap.to(animationTargets, {
      scale: 0.95,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const resetPressVisual = () => {
    hellCursor.classList.remove("is-pressed");

    gsap.to(animationTargets, {
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
    });

    gsap.to(uiElements, {
      y: 0,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const triggerScroll = () => {
    if (scrollTriggered) return;
    scrollTriggered = true;
    cursorDragging = false;

    resetPressVisual();

    // hell-3 배경 사운드 중지
    if (window.rogueWaveBgm) {
      window.rogueWaveBgm.pause();
      window.rogueWaveBgm.currentTime = 0;
    }

    hellCursor.style.transition = "opacity 0.4s ease-out";
    hellCursor.style.opacity = "0";

    setTimeout(() => {
      disableCursor();
      hellCursor.style.removeProperty("transition");
      hellCursor.style.removeProperty("opacity");
    }, 400);

    const bottomEmptyPosition = bottomEmpty.offsetTop;

    gsap.to(window, {
      duration: 2.5,
      scrollTo: bottomEmptyPosition,
      ease: "power3.inOut",
      onComplete: () => {
        if (window.navigateWithTransition) {
          window.navigateWithTransition("../www5/hell-4.html");
        } else {
          window.location.href = "../www5/hell-4.html";
        }
      },
    });
  };

  const isInsideHell1 = (x, y) => {
    const rect = hell1Wrapper.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  };

  const handlePointerDown = (event) => {
    if (scrollTriggered) return;
    if (event.target.closest(".hell-3-ui-header")) return;

    // cam 영역은 드래그 로직에서 완전히 제외 (클릭 애니메이션이 작동하도록)
    const elementsAtPoint = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const camElement = elementsAtPoint.find(
      (el) => el.classList.contains("cam") || el.closest(".cam")
    );

    if (
      camElement ||
      elementsAtPoint.some((el) => el.closest(".cam-wrapper"))
    ) {
      cursorDragging = false;
      // disableCursor() 제거 - cam 클릭해도 커서는 유지 (handlePointerMove에서 opacity로 제어)
      return; // stopPropagation 삭제 - 클릭 이벤트가 정상 작동하도록
    }

    if (!isInsideHell1(event.clientX, event.clientY)) return;

    // enableCursor() 호출 전에 cam 영역인지 다시 한번 확인
    const elementsAtPointCheck = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const camElementCheck = elementsAtPointCheck.find(
      (el) => el.classList.contains("cam") || el.closest(".cam")
    );

    if (
      camElementCheck ||
      elementsAtPointCheck.some((el) => el.closest(".cam-wrapper"))
    ) {
      cursorDragging = false;
      // disableCursor() 제거 - cam 클릭해도 커서는 유지 (handlePointerMove에서 opacity로 제어)
      return;
    }

    enableCursor();

    originX = event.clientX;
    originY = event.clientY;
    dragStartY = event.clientY;

    hellCursor.style.setProperty("--cursor-y-initial", `${originY}px`);
    hellCursor.style.setProperty("--cursor-x-initial", `${originX}px`);

    setCursorPos(originX, originY);
    setCursorOffset(0);
    setLowerScale(1);

    cursorDragging = true;
    
    // 드래그 시작 효과음 재생 (한 번만)
    if (!dragSoundPlayed) {
      dragStartSound.currentTime = 0;
      dragStartSound.play().catch((err) => {
        console.warn("드래그 시작 효과음 재생 실패:", err);
      });
      dragSoundPlayed = true;
    }
    
    startPressVisual();

    event.preventDefault();
  };

  const handlePointerMove = (event) => {
    if (scrollTriggered) {
      disableCursor();
      return;
    }

    // cam 영역에서는 드래그 로직 실행하지 않음 (클릭 애니메이션이 작동하도록)
    const elementsAtPoint = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const camElement = elementsAtPoint.find(
      (el) => el.classList.contains("cam") || el.closest(".cam")
    );

    if (
      camElement ||
      elementsAtPoint.some((el) => el.closest(".cam-wrapper"))
    ) {
      // cam 영역에서는 드래그 상태 완전 초기화 및 커서 비활성화
      if (cursorDragging) {
        cursorDragging = false;
        resetPressVisual();
        setCursorOffset(0);
        setLowerScale(1);
      }

      // 커서 opacity를 0으로 설정 (사라지게)
      if (cursorActive) {
        gsap.to(hellCursor, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.out",
        });
      }

      // cam 이미지에 깜빡거리는 효과 추가
      const actualCam = camElement?.classList.contains("cam")
        ? camElement
        : camElement?.closest(".cam") ||
          elementsAtPoint.find((el) => el.classList.contains("cam"));

      if (actualCam && !actualCam.classList.contains("is-cursor-over")) {
        actualCam.classList.add("is-cursor-over");
      }

      // 모든 cam 이미지에 깜빡거리는 효과 적용
      const allCams = document.querySelectorAll(".cam");
      allCams.forEach((cam) => {
        if (!cam.classList.contains("is-cursor-over")) {
          cam.classList.add("is-cursor-over");
        }
      });

      isOverCam = true;
      return; // 클릭 이벤트가 정상적으로 발생하도록 여기서 멈춤
    }

    // cam 영역 밖으로 나갔을 때
    if (isOverCam) {
      // 커서를 다시 활성화하고 opacity를 1로 복원
      enableCursor(); // 커서 활성화 (cursorActive가 false였을 수 있으므로)
      gsap.to(hellCursor, {
        opacity: 1,
        duration: 0.2,
        ease: "power2.out",
      });

      // cam 이미지의 깜빡거리는 효과 제거
      const allCams = document.querySelectorAll(".cam");
      allCams.forEach((cam) => {
        cam.classList.remove("is-cursor-over");
      });

      isOverCam = false;
    }

    if (isInsideHell1(event.clientX, event.clientY)) {
      // cam 영역이 아닐 때만 커서 활성화
      const elementsAtPointCheck = document.elementsFromPoint(
        event.clientX,
        event.clientY
      );
      const camElementCheck = elementsAtPointCheck.find(
        (el) => el.classList.contains("cam") || el.closest(".cam")
      );

      if (
        !camElementCheck &&
        !elementsAtPointCheck.some((el) => el.closest(".cam-wrapper"))
      ) {
        enableCursor();
      }

      setCursorPos(event.clientX, event.clientY);

      if (cursorDragging) {
        const deltaY = event.clientY - dragStartY;
        const clamped = Math.max(0, Math.min(MAX_DRAG, deltaY));

        setCursorOffset(clamped);

        const progress = clamped / MAX_DRAG;
        setLowerScale(1 + 0.15 * progress);

        const parallaxY = clamped * PARALLAX_RATIO;

        gsap.set(animationTargets, { y: parallaxY });
        gsap.set(uiElements, { y: parallaxY });

        if (clamped >= MAX_DRAG) {
          triggerScroll();
        }
      }
    } else {
      if (!cursorDragging) {
        disableCursor();
      }
    }
  };

  const handlePointerUp = (event) => {
    if (scrollTriggered) return;

    // cam 영역에서는 드래그 상태 완전 초기화 및 클릭 이벤트 트리거
    const elementsAtPoint = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const camElement = elementsAtPoint.find(
      (el) => el.classList.contains("cam") || el.closest(".cam")
    );

    if (
      camElement ||
      elementsAtPoint.some((el) => el.closest(".cam-wrapper"))
    ) {
      const actualCam = camElement?.classList.contains("cam")
        ? camElement
        : camElement?.closest(".cam") ||
          elementsAtPoint.find((el) => el.classList.contains("cam"));

      // 드래그 거리가 작으면 (클릭으로 간주) 클릭 이벤트 트리거
      if (cursorDragging) {
        const dragDistance = Math.abs(event.clientY - dragStartY);
        if (dragDistance < 10) {
          // 10px 미만이면 클릭으로 간주
          if (actualCam) {
            const clickEvent = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            actualCam.dispatchEvent(clickEvent);
          }
        }
      } else if (actualCam) {
        // 드래그가 시작되지 않았다면 바로 클릭 이벤트 트리거
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        actualCam.dispatchEvent(clickEvent);
      }

      cursorDragging = false;
      // disableCursor() 제거 - cam 클릭해도 커서는 유지 (handlePointerMove에서 opacity로 제어)
      resetPressVisual();
      setCursorOffset(0);
      setLowerScale(1);
      return;
    }

    if (!cursorDragging) return;

    cursorDragging = false;
    resetPressVisual();
    setCursorOffset(0);
    setLowerScale(1);
  };

  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerup", handlePointerUp);
  document.addEventListener("pointercancel", handlePointerUp);

  window.addEventListener("blur", () => {
    handlePointerUp();
    disableCursor();
  });

  window.addEventListener("pointerleave", () => {
    handlePointerUp();
    disableCursor();
  });
}

function initModal() {
  const trigger = document.querySelector(".ui-icon img"); // 클릭할 이미지
  const modalOverlay = document.querySelector(".modal-overlay"); // 모달 배경
  const modalContent = document.querySelector(".modal-content"); // 모달 내용 박스
  const closeBtn = document.querySelector(".modal-close-btn"); // 닫기 버튼

  if (!trigger || !modalOverlay) return;

  // 1. 모달 열기 애니메이션
  const openModal = () => {
    gsap.to(modalOverlay, {
      autoAlpha: 1, // opacity:1 + visibility:visible
      duration: 0.3,
    });

    // 내용이 살짝 떠오르는 효과
    gsap.to(modalContent, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  // 2. 모달 닫기 애니메이션
  const closeModal = () => {
    gsap.to(modalOverlay, {
      autoAlpha: 0,
      duration: 0.3,
    });

    gsap.to(modalContent, {
      y: 20, // 다시 아래로 살짝 내려감
      duration: 0.3,
    });
  };

  // 이벤트 등록
  trigger.addEventListener("click", (e) => {
    e.preventDefault(); // 혹시 모를 기본 동작 방지
    openModal();
  });

  closeBtn.addEventListener("click", closeModal);

  // 배경(어두운 부분)을 클릭해도 닫히게 하려면 추가
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
}

function initFaceShakeOnCamClick() {
  const cam = document.querySelector(".cam");
  const faceWrapper = document.querySelector(".face-wrapper");
  const faces = document.querySelectorAll(".face");
  const die = document.querySelector(".die");

  if (!cam || !faceWrapper || faces.length === 0) return;

  let isShaking = false;
  
  // 🔊 hell-3 전용 cam 클릭 효과음
  const camClickSound = new Audio("../sound/iphone.mp3");

  // capture 단계에서 이벤트 등록 (드래그 로직보다 먼저 실행)
  const handleCamClick = (e) => {
    e.stopPropagation(); // 드래그 로직과의 충돌 방지
    e.preventDefault(); // 기본 동작 방지
    if (isShaking) return;
    isShaking = true;

    // cam 클릭 효과음 재생
    camClickSound.currentTime = 0; // 처음부터 재생
    camClickSound.play().catch((err) => {
      console.warn("cam 클릭 효과음 재생 실패:", err);
    });

    // 얼굴 보이게 (자연스럽게 등장)
    gsap.to(faceWrapper, {
      duration: 0.25,
      opacity: 1,
      ease: "power2.out",
    });

    // 각 face를 살짝 작게 시작해서 자연스럽게 커지게
    faces.forEach((face) => {
      gsap.fromTo(
        face,
        { scale: 0.85 },
        {
          scale: 1,
          duration: 0.25,
          ease: "back.out(2)",
        }
      );
    });

    const tweens = [];

    faces.forEach((face) => {
      const tween = gsap.to(face, {
        // 같은 범위, 조금 더 빠른 속도로 스무스하게 흔들림
        duration: 0.09,
        // 좌우: -5px ~ 5px, 상하: -8px ~ 8px 범위에서 랜덤 흔들림
        x: () => gsap.utils.random(-5, 5),
        y: () => gsap.utils.random(-8, 8),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      tweens.push(tween);
    });

    // face가 흔들리기 시작한 지 3초 후, die가 빠르게 깜빡이다가 자연스럽게 사라짐
    if (die) {
      setTimeout(() => {
        const tl = gsap.timeline();

        tl.to(die, {
          duration: 0.08,
          // 기본 1에서 0.7 정도만 살짝 깜빡이도록 (변화 폭 축소)
          opacity: 0.7,
          repeat: 10,
          yoyo: true,
          ease: "power1.inOut",
        }).to(die, {
          duration: 0.4,
          opacity: 0,
          ease: "power2.out",
        });
      }, 3000);
    }

    // 5초 후 흔들림 정지 및 초기화 (이후에는 face가 둥둥 떠 있게 유지)
    setTimeout(() => {
      tweens.forEach((tween) => tween.kill());

      gsap.to(faces, {
        duration: 0.2,
        x: 0,
        y: 0,
        ease: "power2.out",
      });

      // 흔들림이 끝난 뒤에는 face 이미지를 살짝 위아래로 둥둥 떠 있게 유지
      gsap.to(faces, {
        duration: 1.2,
        y: -8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // faceWrapper는 그대로 보이게 두고 상태만 초기화
      isShaking = false;
    }, 5000);
  };

  // capture 단계에서 이벤트 등록 (드래그 로직보다 먼저 실행)
  cam.addEventListener("pointerdown", handleCamClick, { capture: true });
  cam.addEventListener("click", handleCamClick, { capture: true });
}
