document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".page-transition-overlay");
  const content01 = document.querySelector(".content01");
  // [추가] UI 헤더 선택
  const uiHeader = document.querySelector(".hell-1-ui-header");
  
  // 🔊 hell-1 전용 배경 사운드 (지진 소리)
  let earthquakeBgm = null;
  
  // window 객체에 저장하여 다른 함수에서도 접근 가능하도록
  window.earthquakeBgm = null;

  if (overlay && content01) {
    overlay.addEventListener("transitionend", (e) => {
      if (e.propertyName === "opacity" && overlay.style.opacity === "0") {
        overlay.style.pointerEvents = "none";
        const content01Position = content01.offsetTop;

        // [추가] 스크롤 시작 전, UI를 미리 안 보이게(opacity: 0) 설정
        if (uiHeader) {
          gsap.set(uiHeader, { opacity: 0 });
        }

        // hell-1 안에서만 재생되는 지진 효과음 (무한 반복)
        if (!window.earthquakeBgm) {
          window.earthquakeBgm = new Audio("../../sound/MP_Earthquake.mp3");
          window.earthquakeBgm.loop = true;
          window.earthquakeBgm.volume = 1.0; // 필요하면 볼륨 조절
        }
        // 사용자 상호작용 이후이므로 대부분의 브라우저에서 재생 허용
        window.earthquakeBgm.currentTime = 0;
        window.earthquakeBgm.play().catch((err) => {
          console.warn("hell-1 배경 사운드 재생 실패:", err);
        });

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
                onComplete: () => {
                  // UI 헤더가 나타난 후 0.1초 뒤에 메인로고 깜빡임 시작
                  const mainLogo = document.querySelector(".ui-left img");
                  if (mainLogo) {
                    setTimeout(() => {
                      mainLogo.classList.add("logo-blink");
                    }, 100); // 0.1초 = 100ms
                  }
                },
              });
            }
          },
        });
      }
    });
  }

  initHellCursor();
  initLogoBlink();
  function initArrowAnimation() {
    const trigger = document.querySelector(".arrow-trigger");
    // HTML 상의 순서대로 가져옵니다 (arrow-1, arrow-2, arrow-3, arrow-4)
    const arrows = document.querySelectorAll(".arrow");

    // [설정] 각 화살별 출발 위치 (x, y)와 날아올 때의 각도(rotation)
    // x, y 값은 최종 위치(0,0)를 기준으로 얼마나 떨어져 있는지를 의미합니다.
    const arrowConfigs = [
      { x: -100, y: -1000, rotation: -75 }, // arrow-1
      { x: -1000, y: -600, rotation: -100 }, // arrow-2
      { x: 1500, y: -1000, rotation: 100 }, // arrow-3
      { x: 1300, y: -800, rotation: 130 }, // arrow-4
    ];

    let isAnimating = false;

    if (!trigger || arrows.length === 0) return;

    // 효과음 오디오 객체 생성
    const arrowSound = new Audio("../../sound/MP_Flame Arrow.mp3");
    arrowSound.volume = 1.0; // 볼륨 설정 (0.0 ~ 1.0)

    // capture 단계에서 처리하여 드래그 로직보다 먼저 실행되도록
    const handleTriggerClick = (e) => {
      e.stopPropagation(); // 드래그 로직과의 충돌 방지
      e.preventDefault(); // 기본 동작 방지
      if (isAnimating) return;
      isAnimating = true;

      // 효과음 재생
      arrowSound.currentTime = 0; // 처음부터 재생
      arrowSound.play().catch((error) => {
        // 브라우저 정책으로 인한 자동 재생 실패 시 무시
        console.log("오디오 재생 실패:", error);
      });

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
        },
      });

      // 1. 각기 다른 방향에서 날아와 꽂히는 애니메이션
      tl.fromTo(
        arrows,
        {
          // (i)는 인덱스(0, 1, 2, 3)를 의미합니다. 순서에 맞는 설정값을 가져옵니다.
          x: (i) => arrowConfigs[i].x,
          y: (i) => arrowConfigs[i].y,
          rotation: (i) => arrowConfigs[i].rotation,
          autoAlpha: 0, // opacity: 0 + visibility: hidden
        },
        {
          x: 0, // CSS 원래 위치로
          y: 0, // CSS 원래 위치로
          rotation: 0, // 회전도 원래대로 (0도)
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.inOut",
          stagger: 0.1, // 0.05초 간격으로 다다닥 꽂힘
        }
      )

        // 2. 화살 애니메이션 시작하고 2.5초 뒤에 아이콘 깜빡임 시작
        .call(
          () => {
            const iconImage = document.querySelector(".ui-icon img");
            if (iconImage) {
              iconImage.classList.add("icon-blink");
            }
          },
          null,
          2.5
        ) // 타임라인 시작 후 2.5초 위치에서 실행

        // 3. 화살 유지 (나머지 시간)
        .to(arrows, {
          duration: 4,
        })

        // 4. 사라지면서 초기화 (arrow-1부터 순차적으로)
        .to(arrows, {
          autoAlpha: 0,
          y: 300,
          duration: 0.9,
          stagger: 0.2,
          rotation: (i) => arrowConfigs[i].rotation,
          ease: "power2.in",
          onComplete: () => {
            // 화살 애니메이션이 완전히 끝나면 아이콘 깜빡임 중지
            const iconImage = document.querySelector(".ui-icon img");
            if (iconImage) {
              iconImage.classList.remove("icon-blink");
            }
          },
        });
    };

    // capture 단계에서 이벤트 등록 (드래그 로직보다 먼저 실행)
    trigger.addEventListener("pointerdown", handleTriggerClick, {
      capture: true,
    });
    trigger.addEventListener("click", handleTriggerClick, { capture: true });
  }
  initArrowAnimation();
  initModal();
});

function initHellCursor() {
  const hellCursor = document.querySelector(".hell-cursor");
  const hell1Wrapper = document.querySelector(".hell-1-wrapper");
  const animationTargets = document.querySelectorAll(
    ".hell-1-wrapper, .fire-wrapper"
  );
  const bottomEmpty = document.querySelector(".bottom-empty");
  const uiElements = document.querySelectorAll(
    ".hell-1-ui-header, .arrow-trigger, .modal-overlay"
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
  let dragSoundPlayed = false; // 드래그 시작 효과음 재생 여부

  // 🔊 드래그 시작 효과음
  const dragStartSound = new Audio("../../sound/cloud-sound.mp3");

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

    // hell-1 배경 사운드 중지
    if (window.earthquakeBgm) {
      window.earthquakeBgm.pause();
      window.earthquakeBgm.currentTime = 0;
    }

    // 드래그 가이드 숨기기 (hell-1 전용)
    const dragGuide = document.querySelector(".hell-1-ui .drag-guide");
    if (dragGuide) {
      // 애니메이션 중지
      if (dragGuide._animationTimeline) {
        dragGuide._animationTimeline.kill();
        dragGuide._animationTimeline = null;
      }
      // 가이드 자연스럽게 페이드 아웃
      gsap.to(dragGuide, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          dragGuide.classList.remove("is-visible");
        },
      });
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
          window.navigateWithTransition("../www3/hell-2.html");
        } else {
          window.location.href = "../www3/hell-2.html";
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
    // arrow-trigger 클릭은 드래그 로직에서 완전히 제외
    if (event.target.closest(".arrow-trigger")) {
      event.stopPropagation();
      return;
    }
    if (event.target.closest(".hell-1-ui-header, .modal-overlay")) return;
    if (!isInsideHell1(event.clientX, event.clientY)) return;

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

    if (isInsideHell1(event.clientX, event.clientY)) {
      enableCursor();
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

  const handlePointerUp = () => {
    if (scrollTriggered) return;
    if (!cursorDragging) return;

    cursorDragging = false;
    resetPressVisual();
    setCursorOffset(0);
    setLowerScale(1);
    
    // 드래그 종료 시 효과음 플래그 리셋 (다음 드래그 시작 시 다시 재생되도록)
    dragSoundPlayed = false;
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
      onComplete: () => {
        // 모달이 완전히 닫힌 후 드래그 가이드 표시
        showDragGuide();
      },
    });
  };

  // 이벤트 등록
  trigger.addEventListener("click", (e) => {
    e.preventDefault(); // 혹시 모를 기본 동작 방지
    // 아이콘 클릭 시 깜빡임 중지
    trigger.classList.remove("icon-blink");
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

function showDragGuide() {
  // hell-1 전용: .hell-1-ui 내부의 드래그 가이드만 선택
  const dragGuide = document.querySelector(".hell-1-ui .drag-guide");
  if (!dragGuide) return;

  // 드래그 가이드 표시
  dragGuide.classList.add("is-visible");

  // 작은 원이 내려오는 애니메이션과 선의 그라데이션 효과를 동기화
  const upperCircle = dragGuide.querySelector(".drag-guide__upper-circle");
  const line = dragGuide.querySelector(".drag-guide__line");

  // GSAP으로 정확한 애니메이션 제어
  const tl = gsap.timeline({ repeat: -1 });

  // timeline을 dragGuide 요소에 저장 (나중에 kill하기 위해)
  dragGuide._animationTimeline = tl;

  // 작은 원이 내려오면서 선의 상단이 사라지는 애니메이션
  // 작은 원이 큰 원의 중앙보다 더 아래로 내려가도록
  tl.to(upperCircle, {
    bottom: 12.5, // 큰 원의 중앙보다 더 아래로 (55px / 2 = 27.5px, 약간 더 아래로)
    duration: 1,
    ease: "power2.inOut",
  })
    .to(
      line,
      {
        scaleY: 0, // 선의 상단이 사라지도록 (하단 고정)
        transformOrigin: "bottom center",
        duration: 1,
        ease: "power2.inOut",
      },
      "<" // 동시에 시작
    )
    .to(upperCircle, {
      bottom: 210, // 원래 위치로 (150px 선 + 60px 큰 원 = 210px)
      duration: 1,
      ease: "power2.inOut",
    })
    .to(
      line,
      {
        scaleY: 1, // 선이 다시 나타나도록
        duration: 1,
        ease: "power2.inOut",
      },
      "<" // 동시에 시작
    );
}

function initLogoBlink() {
  const mainLogo = document.querySelector(".ui-left img");
  const rectHint = document.querySelector(".rect-hint");

  if (!mainLogo || !rectHint) return;

  // 마우스 호버 시 깜빡임 중지
  mainLogo.addEventListener("mouseenter", () => {
    // rect-hint가 나타나는지 확인 (약간의 지연을 두고 확인)
    setTimeout(() => {
      const rectHintOpacity = window.getComputedStyle(rectHint).opacity;
      if (parseFloat(rectHintOpacity) > 0) {
        // 텍스트가 위로 올라왔으면 깜빡임 중지
        mainLogo.classList.remove("logo-blink");
      }
    }, 100);
  });

  // 마우스가 떠나도 깜빡임은 다시 시작하지 않음 (요구사항에 따라)
}
