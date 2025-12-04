document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".page-transition-overlay");
  const content01 = document.querySelector(".content01");
  // [추가] UI 헤더 선택
  const uiHeader = document.querySelector(".hell-5-ui-header");
  
  // 🔊 hell-5 전용 배경 사운드 (boom 소리)
  let boomBgm = null;

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
            // hell-5 안에서만 재생되는 boom 효과음 (무한 반복)
            if (!window.boomBgm) {
              window.boomBgm = new Audio("../sound/boom.mp3");
              window.boomBgm.loop = true;
              window.boomBgm.volume = 1.0; // 필요하면 볼륨 조절
            }
            window.boomBgm.currentTime = 0;
            window.boomBgm.play().catch((err) => {
              console.warn("hell-5 배경 사운드 재생 실패:", err);
            });
          },
        });
      }
    });
  }

  // 전역 변수: end-hand 애니메이션 트리거 여부
  window.handAnimationTriggered = false;
  // 전역 변수: 커서 표시 여부
  window.cursorVisible = false;

  initSimpleCursor(); // hell-5에서는 드래그 스크롤 없이 마우스 추적만 (초기에는 숨김)

  initEndHandHover(); // end-hand 이미지 호버 애니메이션
  initRedCircleDrag(); // 빨간 선원 드래그로 end-eye 이동
  initModal();
  initScreenRipple();
});

function initHellCursor() {
  const hellCursor = document.querySelector(".hell-cursor");
  const hell1Wrapper = document.querySelector(".hell-5-wrapper");
  const animationTargets = document.querySelectorAll(
    ".hell-5-wrapper, .screen-wrapper, .die-wrapper"
  );
  const bottomEmpty = document.querySelector(".bottom-empty");
  const uiElements = document.querySelectorAll(
    ".hell-5-ui-header, .modal-overlay"
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
    // screen 이미지를 클릭할 때는 드래그/스크롤 로직을 막고 바로 리턴 (클릭 이벤트만 동작)
    if (event.target.closest(".screen")) return;
    if (event.target.closest(".hell-5-ui-header")) return;
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

function initSimpleCursor() {
  const hellCursor = document.querySelector(".hell-cursor");
  const uiElements = document.querySelectorAll(
    ".hell-5-ui-header, .modal-overlay"
  );

  if (!hellCursor) return;

  // 초기에는 커서를 숨김 (end-hand 호버 모션이 작동하면 표시됨)
  gsap.set(hellCursor, { opacity: 0 });

  // end-eye 회전을 위한 변수
  const endEye = document.querySelector(".end-eye");
  let currentMouseX = window.innerWidth / 2;
  let currentMouseY = window.innerHeight / 2;
  let lastMouseX = window.innerWidth / 2;
  let lastMouseY = window.innerHeight / 2;
  let lastTime = Date.now();
  const FAST_MOVE_THRESHOLD = 5; // 빠른 움직임 기준 (픽셀/프레임)
  const QUICK_ROTATION = 20; // 빠른 움직임 시 회전 각도
  let baseRotation = 0; // 기본 회전 각도
  let animationFrameId = null;

  // 마우스 움직임에 따라 커서 위치 업데이트
  const setCursorPos = (x, y) => {
    hellCursor.style.setProperty("--cursor-x", `${x}px`);
    hellCursor.style.setProperty("--cursor-y", `${y}px`);
    // end-eye 회전을 위한 마우스 위치도 업데이트
    currentMouseX = x;
    currentMouseY = y;
  };

  // 초기 마우스 위치 설정 (화면 중앙)
  setCursorPos(window.innerWidth / 2, window.innerHeight / 2);

  // UI 요소에 호버 시 커서 숨기기
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

  // CSS 애니메이션의 translateY 값을 읽어서 회전과 함께 적용
  const updateEndEyeWithRotation = () => {
    if (!endEye) return;

    // 빨간 원 드래그 중이 아닐 때만 CSS 애니메이션과 함께 작동
    const isDragging = endEye.style.animation === "none";

    if (!isDragging) {
      // 현재 마우스 위치로 회전 각도 계산 (항상 업데이트)
      const eyeRect = endEye.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;

      // 커서 방향 계산
      const angleToCursor = Math.atan2(
        currentMouseY - eyeCenterY,
        currentMouseX - eyeCenterX
      );
      const angleDeg = (angleToCursor * 180) / Math.PI;

      // 현재 회전 각도 가져오기
      let currentRotation =
        parseFloat(endEye.style.getPropertyValue("--eye-rotation")) || 0;
      if (isNaN(currentRotation)) currentRotation = 0;

      // 마우스 이동 속도 계산
      const deltaX = currentMouseX - lastMouseX;
      const deltaY = currentMouseY - lastMouseY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const currentTime = Date.now();
      const deltaTime = Math.max(16, currentTime - lastTime);
      const speed = distance / (deltaTime / 16);

      if (speed > FAST_MOVE_THRESHOLD && deltaTime < 100) {
        // 빠른 움직임: 커서가 움직이는 방향에 맞춰서 20도만 빠르게 회전
        const moveAngle = Math.atan2(deltaY, deltaX);
        const moveAngleDeg = (moveAngle * 180) / Math.PI;

        // 현재 회전 각도에서 움직이는 방향으로 20도만 추가 회전
        const angleDiff = moveAngleDeg - currentRotation;
        let normalizedDiff = ((angleDiff + 180) % 360) - 180;

        const rotationAmount =
          Math.sign(normalizedDiff) *
          Math.min(Math.abs(normalizedDiff), QUICK_ROTATION);
        baseRotation = currentRotation + rotationAmount;
        baseRotation = ((baseRotation + 180) % 360) - 180;
        currentRotation = baseRotation;
      } else {
        // 느린 움직임: 커서를 바라보도록 회전
        currentRotation = angleDeg;
        baseRotation = angleDeg;
      }

      // CSS 변수로 회전 각도 설정 (CSS 애니메이션이 자동으로 적용)
      endEye.style.setProperty("--eye-rotation", `${currentRotation}deg`);

      lastMouseX = currentMouseX;
      lastMouseY = currentMouseY;
      lastTime = currentTime;
    } else {
      // 드래그 중일 때는 transform을 직접 설정 (기존 로직 유지)
      const currentRotation =
        parseFloat(endEye.style.getPropertyValue("--eye-rotation")) || 0;
      // 드래그 중 transform은 initRedCircleDrag에서 처리
    }

    animationFrameId = requestAnimationFrame(updateEndEyeWithRotation);
  };

  // end-eye 회전 업데이트 시작 (CSS 애니메이션과 함께 작동)
  if (endEye) {
    // 초기 마우스 위치 설정
    lastMouseX = currentMouseX;
    lastMouseY = currentMouseY;

    // 회전 업데이트 시작
    updateEndEyeWithRotation();
  }

  // 마우스 움직임 추적 (pointermove와 mousemove 모두 처리)
  const handleMouseMove = (event) => {
    setCursorPos(event.clientX, event.clientY);
  };

  document.addEventListener("pointermove", handleMouseMove);
  document.addEventListener("mousemove", handleMouseMove);

  // 클릭 시 빨간색으로 변경 (빨간 원 클릭은 제외)
  document.addEventListener("pointerdown", (event) => {
    // 빨간 원 클릭은 무시
    if (event.target.closest(".red-circle")) return;
    hellCursor.classList.add("is-pressed");
  });

  document.addEventListener("pointerup", () => {
    hellCursor.classList.remove("is-pressed");
  });

  document.addEventListener("pointercancel", () => {
    hellCursor.classList.remove("is-pressed");
  });
}

function initEndHandHover() {
  const endHandImages = document.querySelectorAll(
    ".end-hand1, .end-hand2, .end-hand3, .end-hand4, .end-hand5, .end-hand6, .end-hand7, .end-hand8, .end-hand9, .end-hand10, .end-hand11"
  );

  if (!endHandImages.length) return;

  const PROXIMITY_DISTANCE = 50; // 이미지 상단 근처 50픽셀
  const TOP_AREA_HEIGHT = 80; // 이미지 상단 영역 높이
  const LIFT_DISTANCE = -100; // 위로 100픽셀
  const animationMap = new Map(); // 각 이미지의 애니메이션 상태 추적

  const checkProximity = (event) => {
    // end-eye 드래그 후에는 호버 모션 작동 안 함
    if (window.handAnimationTriggered) return;

    const cursorX = event.clientX;
    const cursorY = event.clientY;

    endHandImages.forEach((img) => {
      const rect = img.getBoundingClientRect();

      // 이미지 상단 영역 (상단에서 TOP_AREA_HEIGHT 픽셀 범위)
      const topAreaTop = rect.top;
      const topAreaBottom = rect.top + TOP_AREA_HEIGHT;
      const topAreaLeft = rect.left;
      const topAreaRight = rect.left + rect.width;

      // 커서가 이미지 상단 영역 근처에 있는지 확인
      const isNearTopArea =
        cursorY >= topAreaTop - PROXIMITY_DISTANCE &&
        cursorY <= topAreaBottom + PROXIMITY_DISTANCE &&
        cursorX >= topAreaLeft - PROXIMITY_DISTANCE &&
        cursorX <= topAreaRight + PROXIMITY_DISTANCE;

      // 상단 근처에 있고, 아직 애니메이션이 실행되지 않았다면
      if (isNearTopArea && !animationMap.get(img)) {
        animationMap.set(img, true);

        // 빠르게 위로 100픽셀 튀어 올라오듯이 올라가기
        // 애니메이션이 실제로 시작될 때 커서 표시
        gsap.to(img, {
          y: LIFT_DISTANCE,
          duration: 0.2, // 빠르게
          ease: "power2.out",
          onStart: () => {
            // 커서와 텍스트 표시 (한 번만 실행)
            if (!window.cursorVisible) {
              window.cursorVisible = true;
              const hellCursor = document.querySelector(".hell-cursor");
              if (hellCursor) {
                hellCursor.classList.add("is-active");
                gsap.to(hellCursor, {
                  opacity: 1,
                  duration: 0.5,
                  ease: "power2.out",
                });
              }
            }
          },
          onComplete: () => {
            // 천천히 다시 원래 위치로 복귀
            gsap.to(img, {
              y: 0,
              duration: 1.0, // 천천히
              ease: "power2.out",
              onComplete: () => {
                // GSAP transform 제거
                gsap.set(img, { clearProps: "y" });
                // 애니메이션 완료 후 상태 초기화
                animationMap.set(img, false);
              },
            });
          },
        });
      } else if (!isNearTopArea) {
        // 상단 근처에서 멀어지면 상태 초기화 (다시 접근 가능하도록)
        if (animationMap.get(img)) {
          // 애니메이션이 진행 중이 아니라면 상태만 초기화
          const currentY = gsap.getProperty(img, "y");
          if (currentY === 0) {
            animationMap.set(img, false);
          }
        }
      }
    });
  };

  document.addEventListener("pointermove", checkProximity);
}

function initRedCircleDrag() {
  const redCircle = document.querySelector(".red-circle");
  const endEye = document.querySelector(".end-eye");
  const hellCursor = document.querySelector(".hell-cursor");

  if (!redCircle || !endEye) {
    console.log("빨간 원 또는 end-eye를 찾을 수 없습니다.");
    return;
  }

  console.log("빨간 원 드래그 초기화 완료", redCircle);

  let isDragging = false;
  let startY = 0;
  let currentCircleY = 0;
  let currentEyeY = 0;

  // CSS 애니메이션 중지 (드래그 중에는 애니메이션 비활성화)
  const stopAnimations = () => {
    redCircle.style.animation = "none";
    endEye.style.animation = "none";
  };

  // end-hand 이미지 애니메이션 시작
  const startHandAnimations = () => {
    if (window.handAnimationTriggered) return;
    window.handAnimationTriggered = true;

    const endHandImages = document.querySelectorAll(
      ".end-hand1, .end-hand2, .end-hand3, .end-hand4, .end-hand5, .end-hand6, .end-hand7, .end-hand8, .end-hand9, .end-hand10, .end-hand11"
    );

    endHandImages.forEach((img, index) => {
      // 각 이미지마다 0.1초 간격으로 시작 (더 빠르게)
      setTimeout(() => {
        // CSS 애니메이션 중지
        img.style.animation = "none";

        // 현재 y 위치 가져오기 (GSAP transform 또는 기본값)
        const currentY = parseFloat(gsap.getProperty(img, "y")) || 0;

        // transform-origin을 상단 중앙으로 설정
        gsap.set(img, { transformOrigin: "50% 0%" });

        // 첫 번째: 작게 커지기
        gsap.to(img, {
          scale: 1.8, // 1.8배로 커지기
          duration: 0.1,
          ease: "power2.out",
        });

        // 위로 80픽셀씩 반복 이동 (최대 10번)
        let moveCount = 0;
        const moveUp = () => {
          // 10번까지만 이동
          if (moveCount >= 10) return;

          // 현재 위치에서 위로 80픽셀씩 이동 (상대 이동)
          const targetY = currentY - 80 * (moveCount + 1);

          gsap.to(img, {
            y: targetY,
            duration: 0.1,
            ease: "power2.out",
            onComplete: () => {
              // 각 이동마다 계속 커지기 (화면에 꽉 차도록)
              const currentScale =
                parseFloat(gsap.getProperty(img, "scale")) || 1.8;
              const nextScale = currentScale + 1.0; // 1.0씩 증가하여 화면에 꽉 차도록

              gsap.to(img, {
                scale: nextScale,
                duration: 0.1,
                ease: "power2.out",
              });

              // 0.1초 멈춤
              setTimeout(() => {
                moveCount++;
                if (moveCount < 10) {
                  moveUp(); // 다시 80픽셀 올라가기
                }
              }, 100);
            },
          });
        };

        // 첫 번째 이동 시작
        moveUp();
      }, index * 100); // 0.1초 간격 (더 빠르게)
    });
  };

  // 마우스 좌표가 빨간 원 영역 안에 있는지 확인
  const isPointInCircle = (x, y) => {
    const rect = redCircle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;

    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );

    return distance <= radius;
  };

  const handlePointerDown = (event) => {
    console.log(
      "pointerdown 이벤트 발생",
      event.target,
      event.clientX,
      event.clientY
    );

    // 마우스 좌표로 빨간 원 영역 확인
    const isInCircle = isPointInCircle(event.clientX, event.clientY);
    console.log("빨간 원 영역인가?", isInCircle);

    if (!isInCircle) {
      return;
    }

    console.log("빨간 원 클릭 감지!");

    // 이벤트 전파 중지
    event.stopPropagation();
    event.preventDefault();

    isDragging = true;
    startY = event.clientY;
    currentCircleY = 0;
    currentEyeY = 0;

    // 커서를 빨간색으로 변경
    if (hellCursor) {
      hellCursor.classList.add("is-pressed");
    }

    stopAnimations();
    console.log("드래그 시작, startY:", startY);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;

    event.stopPropagation();

    const deltaY = event.clientY - startY;
    console.log("드래그 중, deltaY:", deltaY);

    // 위로만 드래그 가능 (음수 값)
    const moveY = Math.min(0, deltaY);

    // 최대 130픽셀 위로만 이동
    const clampedY = Math.max(-130, moveY);

    currentCircleY = clampedY;
    currentEyeY = clampedY;

    // 빨간 선원과 end-eye를 같은 거리만큼 위로 이동
    // translateX(-50%)를 유지하면서 y만 변경
    redCircle.style.transform = `translateX(-50%) translateY(${currentCircleY}px)`;

    // end-eye는 CSS 변수로 y 위치 설정하고 CSS 애니메이션 중지
    endEye.style.animation = "none";
    const currentRotation =
      parseFloat(endEye.style.getPropertyValue("--eye-rotation")) || 0;
    endEye.style.transform = `translateX(-50%) translateY(${currentEyeY}px) rotate(${currentRotation}deg)`;

    // 130픽셀에 도달하면 end-hand 애니메이션 시작 및 4초 후 door.html로 이동
    if (clampedY <= -130 && !window.handAnimationTriggered) {
      console.log("130픽셀 도달! end-hand 애니메이션 시작");
      startHandAnimations();
      
      // 4초 후 door.html로 자연스럽게 이동
      setTimeout(() => {
        // hell-5 배경 사운드 페이드아웃
        if (window.boomBgm) {
          gsap.to(window.boomBgm, {
            volume: 0,
            duration: 1,
            onComplete: () => {
              window.boomBgm.pause();
              window.boomBgm.currentTime = 0;
            }
          });
        }
        
        // 페이지 전체 페이드아웃 후 이동
        const overlay = document.querySelector(".page-transition-overlay");
        if (overlay) {
          overlay.style.pointerEvents = "auto";
          gsap.to(overlay, {
            opacity: 1,
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
              window.location.href = "../door.html";
            }
          });
        } else {
          // 오버레이가 없으면 body 전체를 페이드아웃
          gsap.to("body", {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
              window.location.href = "../door.html";
            }
          });
        }
      }, 4000); // 4초 후 실행
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;

    console.log("드래그 종료");
    isDragging = false;

    // 커서를 원래대로 복귀
    if (hellCursor) {
      hellCursor.classList.remove("is-pressed");
    }
  };

  // document 레벨에서 클릭 감지 (다른 요소가 가로채는 경우 대비)
  const documentHandlePointerDown = (event) => {
    // 마우스 좌표로 빨간 원 영역 확인
    const isInCircle = isPointInCircle(event.clientX, event.clientY);

    if (isInCircle) {
      console.log("document 레벨에서 빨간 원 클릭 감지");
      handlePointerDown(event);
    }
  };

  // 이벤트 리스너 등록 - document 레벨에서만 감지 (다른 요소가 가로채도 작동)
  document.addEventListener("pointerdown", documentHandlePointerDown, {
    passive: false,
    capture: true,
  });
  document.addEventListener("pointermove", handlePointerMove, {
    passive: false,
  });
  document.addEventListener("pointerup", handlePointerUp);
  document.addEventListener("pointercancel", handlePointerUp);

  // 마우스 이벤트도 추가 (호환성)
  document.addEventListener("mousedown", documentHandlePointerDown, {
    capture: true,
  });
  document.addEventListener("mousemove", handlePointerMove);
  document.addEventListener("mouseup", handlePointerUp);
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

  screens.forEach((screen) => {
    screen.addEventListener("click", (e) => {
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
    });
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
