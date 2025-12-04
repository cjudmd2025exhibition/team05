document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".page-transition-overlay");
  const content01 = document.querySelector(".content01");
  // [추가] UI 헤더 선택
  const uiHeader = document.querySelector(".hell-4-ui-header");

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
          },
        });
      }
    });
  }

  initHellCursor();
  initModal();
  initScreenRipple();
});

function initHellCursor() {
  const hellCursor = document.querySelector(".hell-cursor");
  const hell1Wrapper = document.querySelector(".hell-4-wrapper");
  const animationTargets = document.querySelectorAll(
    ".hell-4-wrapper, .screen-wrapper, .die-wrapper"
  );
  const bottomEmpty = document.querySelector(".bottom-empty");
  const uiElements = document.querySelectorAll(
    ".hell-4-ui-header, .modal-overlay"
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
  let isOverScreen = false; // screen 위에 커서가 있는지 추적
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
          window.navigateWithTransition("../www6/hell-5.html");
        } else {
          window.location.href = "../www6/hell-5.html";
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
    if (event.target.closest(".hell-4-ui-header")) return;

    // screen 영역은 드래그 로직에서 완전히 제외 (클릭 애니메이션이 작동하도록)
    const elementsAtPoint = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const screenElement = elementsAtPoint.find(
      (el) => el.classList.contains("screen") || el.closest(".screen")
    );

    if (
      screenElement ||
      elementsAtPoint.some((el) => el.closest(".screen-wrapper"))
    ) {
      cursorDragging = false;
      // disableCursor() 제거 - screen 클릭해도 커서는 유지 (handlePointerMove에서 opacity로 제어)
      return; // stopPropagation 삭제 - 클릭 이벤트가 정상 작동하도록
    }

    if (!isInsideHell1(event.clientX, event.clientY)) return;

    // enableCursor() 호출 전에 screen 영역인지 다시 한번 확인
    const elementsAtPointCheck = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const screenElementCheck = elementsAtPointCheck.find(
      (el) => el.classList.contains("screen") || el.closest(".screen")
    );

    if (
      screenElementCheck ||
      elementsAtPointCheck.some((el) => el.closest(".screen-wrapper"))
    ) {
      cursorDragging = false;
      // disableCursor() 제거 - screen 클릭해도 커서는 유지 (handlePointerMove에서 opacity로 제어)
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

    // screen 영역에서는 드래그 로직 실행하지 않음 (클릭 애니메이션이 작동하도록)
    const elementsAtPoint = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const screenElement = elementsAtPoint.find(
      (el) => el.classList.contains("screen") || el.closest(".screen")
    );

    if (
      screenElement ||
      elementsAtPoint.some((el) => el.closest(".screen-wrapper"))
    ) {
      // screen 영역에서는 드래그 상태 완전 초기화 및 커서 비활성화
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

      // screen 이미지에 깜빡거리는 효과 추가
      const actualScreen = screenElement?.classList.contains("screen")
        ? screenElement
        : screenElement?.closest(".screen") ||
          elementsAtPoint.find((el) => el.classList.contains("screen"));

      if (actualScreen && !actualScreen.classList.contains("is-cursor-over")) {
        actualScreen.classList.add("is-cursor-over");
      }

      // 모든 screen 이미지에 깜빡거리는 효과 적용
      const allScreens = document.querySelectorAll(".screen");
      allScreens.forEach((screen) => {
        if (!screen.classList.contains("is-cursor-over")) {
          screen.classList.add("is-cursor-over");
        }
      });

      isOverScreen = true;
      return; // 클릭 이벤트가 정상적으로 발생하도록 여기서 멈춤
    }

    // screen 영역 밖으로 나갔을 때
    if (isOverScreen) {
      // 커서를 다시 활성화하고 opacity를 1로 복원
      enableCursor(); // 커서 활성화 (cursorActive가 false였을 수 있으므로)
      gsap.to(hellCursor, {
        opacity: 1,
        duration: 0.2,
        ease: "power2.out",
      });

      // screen 이미지의 깜빡거리는 효과 제거
      const allScreens = document.querySelectorAll(".screen");
      allScreens.forEach((screen) => {
        screen.classList.remove("is-cursor-over");
      });

      isOverScreen = false;
    }

    if (isInsideHell1(event.clientX, event.clientY)) {
      // screen 영역이 아닐 때만 커서 활성화
      const elementsAtPointCheck = document.elementsFromPoint(
        event.clientX,
        event.clientY
      );
      const screenElementCheck = elementsAtPointCheck.find(
        (el) => el.classList.contains("screen") || el.closest(".screen")
      );

      if (
        !screenElementCheck &&
        !elementsAtPointCheck.some((el) => el.closest(".screen-wrapper"))
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

    // screen 영역에서는 드래그 상태 완전 초기화 및 클릭 이벤트 트리거
    const elementsAtPoint = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const screenElement = elementsAtPoint.find(
      (el) => el.classList.contains("screen") || el.closest(".screen")
    );

    if (
      screenElement ||
      elementsAtPoint.some((el) => el.closest(".screen-wrapper"))
    ) {
      const actualScreen = screenElement?.classList.contains("screen")
        ? screenElement
        : screenElement?.closest(".screen") ||
          elementsAtPoint.find((el) => el.classList.contains("screen"));

      // 드래그 거리가 작으면 (클릭으로 간주) 클릭 이벤트 트리거
      if (cursorDragging) {
        const dragDistance = Math.abs(event.clientY - dragStartY);
        if (dragDistance < 10) {
          // 10px 미만이면 클릭으로 간주
          if (actualScreen) {
            const clickEvent = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            actualScreen.dispatchEvent(clickEvent);
          }
        }
      } else if (actualScreen) {
        // 드래그가 시작되지 않았다면 바로 클릭 이벤트 트리거
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        actualScreen.dispatchEvent(clickEvent);
      }

      cursorDragging = false;
      // disableCursor() 제거 - screen 클릭해도 커서는 유지 (handlePointerMove에서 opacity로 제어)
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

function initScreenRipple() {
  const screens = document.querySelectorAll(".screen");
  const rippleContainer = document.querySelector(".ripple-container");
  const die = document.querySelector(".die");

  if (!screens.length || !rippleContainer || !die) return;

  // 🔊 hell-4 전용 screen 클릭 효과음
  const screenClickSound = new Audio("../sound/dong.mp3");

  screens.forEach((screen) => {
    // capture 단계에서 이벤트 등록 (드래그 로직보다 먼저 실행)
    const handleScreenClick = (e) => {
      e.stopPropagation(); // 드래그 로직과의 충돌 방지
      e.preventDefault(); // 기본 동작 방지

      // screen 클릭 효과음 재생
      screenClickSound.currentTime = 0; // 처음부터 재생
      screenClickSound.play().catch((err) => {
        console.warn("screen 클릭 효과음 재생 실패:", err);
      });
      // CSS 애니메이션 중지 (GSAP transform과 충돌 방지)
      screens.forEach((s) => {
        s.style.animation = "none";
      });

      // screen 이미지를 순차적으로 위로 올리면서 페이드아웃
      // 각각 원래 위치에서 오른쪽으로 15도 각도로 300px 올라가기
      // 15도 각도 계산: x = 300 * tan(15도) = 300 * 0.268 ≈ 80px
      const angle = 15 * (Math.PI / 180); // 15도를 라디안으로 변환
      const moveY = -300; // 위로 300px
      const moveX = 99; // 오른쪽으로 이동 (고정 90px)

      // screen-1부터 순차적으로 각각 원래 위치에서 올라가기
      screens.forEach((s, index) => {
        // 각 screen 이미지의 현재 위치를 기준으로 상대 이동
        gsap.to(s, {
          x: `+=${moveX}`, // 원래 위치에서 오른쪽으로 이동
          y: `+=${moveY}`, // 위로 300px 이동
          opacity: 0, // 처음부터 천천히 페이드아웃
          duration: 3.2, // 두 배로 느리게 (기존 1.6초 → 3.2초)
          delay: index * 0.2, // 순차적으로 시작 (0.2초 간격)
          ease: "power2.out",
        });
      });

      // die-4 이미지의 위치를 기준으로 파장 생성
      const dieRect = die.getBoundingClientRect();
      const containerRect = rippleContainer.getBoundingClientRect();

      const offsetY = 80; // 위로 올리는 거리
      const offsetX = 20; // 오른쪽으로 이동하는 거리 (작게 설정하여 왼쪽으로 이동 효과)
      const centerX =
        dieRect.left + dieRect.width / 2 - containerRect.left + offsetX; // 오른쪽으로 이동
      const centerY =
        dieRect.top + dieRect.height / 2 - containerRect.top - offsetY; // 위로 올림

      // 파장원과 die-4 이미지 모션을 더 늦게 시작하기 위한 delay
      const rippleDelay = 500; // 파장원 시작 delay (500ms)
      const dieShakeDelay = 500; // die-4 흔들림 시작 delay (500ms)

      // 3세트의 파장 생성 (각 세트마다 5개씩)
      for (let set = 0; set < 3; set++) {
        // 각 세트마다 5개의 파장 생성
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            createRipple(rippleContainer, centerX, centerY, 0);
          }, rippleDelay + set * 1200 + i * 200); // delay 추가, 세트 간격: 1200ms, 세트 내 간격: 200ms (0.2초)
        }
      }

      // 파장원 애니메이션이 시작한 직후 die 이미지 흔들림 시작
      // 파장원이 끝날 때까지 흔들림
      // 마지막 파장원 생성 시간: rippleDelay + 2 * 1200 + 4 * 200 = rippleDelay + 3200ms
      // 파장원 애니메이션 duration: 1200ms
      // 마지막 파장원이 끝나는 시간: rippleDelay + 3200 + 1200 = rippleDelay + 4400ms
      // 흔들림 지속 시간: (rippleDelay + 4400ms) - (rippleDelay + dieShakeDelay) = 4400ms - dieShakeDelay

      // CSS floating 애니메이션 중지 (GSAP transform과 충돌 방지)
      setTimeout(() => {
        die.style.animation = "none";

        // die 이미지 빠르게 위아래양옆으로 덜덜 떨듯이 흔들림
        // 위로 10px, 아래로 10px, 왼쪽으로 5px, 오른쪽으로 5px
        // 더 자연스러운 흔들림을 위해 duration과 interval 조정
        let shakeInterval = setInterval(() => {
          gsap.to(die, {
            x: gsap.utils.random(-5, 5),
            y: gsap.utils.random(-10, 10),
            duration: 0.1, // 더 부드러운 움직임을 위해 duration 증가
            ease: "sine.inOut", // 더 자연스러운 easing
          });
        }, 30); // 30ms마다 새로운 랜덤 위치로 이동 (더 빠른 간격)

        // 파장원이 끝난 직후 자연스럽게 원래 모션으로 돌아옴
        setTimeout(() => {
          clearInterval(shakeInterval); // 흔들림 중지
          gsap.to(die, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              // 원래 모션으로 돌아간 후 CSS floating 애니메이션 복구
              die.style.animation = "floating 2s ease-in-out infinite";

              // screen 이미지 3개가 올라간 위치에서 아래로 내려오면서 원위치로 복귀
              // 순서: screen-1 (index 0), screen-3 (index 2), screen-2 (index 1)
              screens.forEach((s, index) => {
                const isCenterScreen = s.classList.contains("center-screen");

                // center-screen의 경우 transform: translateX(-50%)를 먼저 제거하여 GSAP transform과 충돌 방지
                if (isCenterScreen) {
                  s.style.transform = "none";
                }

                // 순서 매핑: screen-1(0) -> delay 0, screen-3(2) -> delay 0.1, screen-2(1) -> delay 0.2
                let delayIndex;
                if (index === 0) delayIndex = 0; // screen-1
                else if (index === 2) delayIndex = 1; // screen-3
                else delayIndex = 2; // screen-2 (index === 1)

                // 올라간 위치에서 아래로 내려오면서 원위치로 복귀
                const descendProps = {
                  y: 0, // 원래 위치로 복귀
                  opacity: 1, // 페이드 인
                  duration: 1.2, // 더 천천히 페이드 인
                  delay: delayIndex * 0.1, // 순차적으로 나타남 (screen-1, screen-3, screen-2 순서)
                  ease: "power2.out",
                  onComplete: () => {
                    // GSAP transform 제거하여 원래 CSS 위치로 복귀
                    if (isCenterScreen) {
                      // center-screen의 경우 y만 제거하고 transform: translateX(-50%)는 유지
                      gsap.set(s, { clearProps: "y" });
                      s.style.transform = "translateX(-50%)";
                    } else {
                      // 다른 screen 이미지들은 모든 transform 제거
                      gsap.set(s, { clearProps: "x,y,transform" });
                    }

                    // 애니메이션 복구
                    s.style.animation = "floating 2s ease-in-out infinite";
                  },
                };

                // center-screen은 x를 건드리지 않고, 나머지 스크린만 x 축 복귀 처리
                if (!isCenterScreen) {
                  descendProps.x = 0;
                }

                gsap.to(s, descendProps);
              });
            },
          });
        }, rippleDelay + 4400 - dieShakeDelay); // 파장원이 끝나는 시간 (rippleDelay + 4400ms)에서 dieShakeDelay를 뺀 시간
      }, dieShakeDelay); // die-4 흔들림 시작 delay
    };

    // capture 단계에서 이벤트 등록 (드래그 로직보다 먼저 실행)
    screen.addEventListener("pointerdown", handleScreenClick, {
      capture: true,
    });
    screen.addEventListener("click", handleScreenClick, { capture: true });
  });
}

function createRipple(container, x, y, delay) {
  const ripple = document.createElement("div");
  ripple.className = "ripple-ellipse";

  // 초기 위치 설정
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.transform = `translate(-50%, -50%) rotate(20.892deg)`;
  ripple.style.transformOrigin = "center";

  container.appendChild(ripple);

  // GSAP 애니메이션: 파장 효과
  gsap.fromTo(
    ripple,
    {
      scaleX: 0.3,
      scaleY: 0.225, // 높이를 조금 더 크게 시작 (덜 타원 모양)
      opacity: 1,
      borderWidth: 4, // 처음에는 더 두꺼운 선
      filter: "blur(0px)",
    },
    {
      scaleX: 3.5, // x축은 더 넓게 확장
      scaleY: 2.6, // y축도 조금 더 크게 확장 (덜 타원 모양)
      opacity: 0,
      borderWidth: 0.3, // 커질수록 더 얇아짐
      filter: "blur(1.2px)",
      duration: 1.2,
      delay: delay,
      ease: "power2.out",
      onComplete: () => {
        ripple.remove();
      },
    }
  );
}
