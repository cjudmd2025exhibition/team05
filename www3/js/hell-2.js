document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".page-transition-overlay");
  const content01 = document.querySelector(".content01");
  // [추가] UI 헤더 선택
  const uiHeader = document.querySelector(".hell-2-ui-header");
  // 🔊 hell-2 전용 배경 사운드 (불 타는 소리)
  let fireBgm = null;

  if (overlay && content01) {
    overlay.addEventListener("transitionend", (e) => {
      if (e.propertyName === "opacity" && overlay.style.opacity === "0") {
        overlay.style.pointerEvents = "none";
        const content01Position = content01.offsetTop;

        // [추가] 스크롤 시작 전, UI를 미리 안 보이게(opacity: 0) 설정
        if (uiHeader) {
          gsap.set(uiHeader, { opacity: 0 });
        }

        // 스크롤 애니메이션 시작과 동시에 파티클/사운드 애니메이션 시작
        initFireParticles();

        // hell-2 안에서만 재생되는 불타는 효과음 (무한 반복)
        if (!fireBgm) {
          fireBgm = new Audio("../sound/MP_Fire Burning.mp3");
          fireBgm.loop = true;
          fireBgm.volume = 0.2; // 필요하면 볼륨 조절
        }
        // 사용자 상호작용 이후이므로 대부분의 브라우저에서 재생 허용
        fireBgm.currentTime = 0;
        fireBgm.play().catch((err) => {
          console.warn("hell-2 배경 사운드 재생 실패:", err);
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
              });
            }
          },
        });
      }
    });
  }

  initHellCursor();
  initModal();
  initSkullHover();
});

function initSkullHover() {
  const skulls = document.querySelectorAll(".skull");

  // 효과음 오디오 객체 생성
  const diceSound = new Audio("../sound/MP_Shake And Roll Dice.mp3");
  diceSound.volume = 1.0;

  skulls.forEach((skull) => {
    skull.addEventListener("mouseenter", () => {
      skull.classList.remove("is-hovered");
      // 강제로 리플로우를 발생시켜 애니메이션을 다시 시작
      void skull.offsetWidth;
      skull.classList.add("is-hovered");
      
      // 효과음 재생 (처음부터 재생)
      diceSound.currentTime = 0;
      diceSound.play().catch((error) => {
        // 브라우저 정책으로 인한 자동 재생 실패 시 무시
        console.log("오디오 재생 실패:", error);
      });
    });

    skull.addEventListener("animationend", () => {
      skull.classList.remove("is-hovered");
        });
    });
  }

function initHellCursor() {
  const hellCursor = document.querySelector(".hell-cursor");
  const hell1Wrapper = document.querySelector(".hell-2-wrapper");
  const animationTargets = document.querySelectorAll(
    ".hell-2-wrapper, .skull-wrapper"
  );
  const bottomEmpty = document.querySelector(".bottom-empty");
  const uiElements = document.querySelectorAll(
    ".hell-2-ui-header, .modal-overlay"
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
  let isOverSkull = false; // skull 위에 커서가 있는지 추적
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
          window.navigateWithTransition("../www4/hell-3.html");
        } else {
          window.location.href = "../www4/hell-3.html";
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
    if (event.target.closest(".hell-2-ui-header")) return;

    // skull 영역은 드래그 로직에서 완전히 제외 (호버 애니메이션이 작동하도록)
    // elementsFromPoint를 사용하여 실제 클릭된 요소 확인
    const elementsAtPoint = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const skullElement = elementsAtPoint.find(
      (el) => el.classList.contains("skull") || el.closest(".skull")
    );

    if (
      skullElement ||
      elementsAtPoint.some((el) => el.closest(".skull-wrapper"))
    ) {
      cursorDragging = false;
      // disableCursor() 제거 - skull 클릭해도 커서는 유지 (handlePointerMove에서 opacity로 제어)
      return; // stopPropagation 삭제 - mouseenter 이벤트가 정상 작동하도록
    }

    if (!isInsideHell1(event.clientX, event.clientY)) return;

    // enableCursor() 호출 전에 skull 영역인지 다시 한번 확인
    const elementsAtPointCheck = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const skullElementCheck = elementsAtPointCheck.find(
      (el) => el.classList.contains("skull") || el.closest(".skull")
    );

    if (
      skullElementCheck ||
      elementsAtPointCheck.some((el) => el.closest(".skull-wrapper"))
    ) {
      cursorDragging = false;
      // disableCursor() 제거 - skull 클릭해도 커서는 유지 (handlePointerMove에서 opacity로 제어)
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

    // preventDefault() 제거 - mouseenter 이벤트가 정상적으로 발생하도록
    // 드래그는 pointermove에서 처리되므로 preventDefault() 없이도 작동함
  };

  const handlePointerMove = (event) => {
    if (scrollTriggered) {
      disableCursor();
      return;
    }

    // skull 영역에서는 드래그 로직 실행하지 않음 (호버 애니메이션이 작동하도록)
    // elementFromPoint는 pointer-events: none인 요소도 반환할 수 있으므로
    // 여러 요소를 체크하여 skull을 정확히 감지
    const elementsAtPoint = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    const skullElement = elementsAtPoint.find(
      (el) => el.classList.contains("skull") || el.closest(".skull")
    );

    if (
      skullElement ||
      elementsAtPoint.some((el) => el.closest(".skull-wrapper"))
    ) {
      // skull 영역에서는 드래그 상태 완전 초기화 및 커서 비활성화
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

      // skull 요소에 직접 mouseenter 이벤트 트리거하여 호버 애니메이션 작동
      const actualSkull = skullElement?.classList.contains("skull")
        ? skullElement
        : skullElement?.closest(".skull") ||
          elementsAtPoint.find((el) => el.classList.contains("skull"));

      if (actualSkull && !actualSkull.classList.contains("is-hovered")) {
        // mouseenter 이벤트 직접 발생시킴
        const mouseEnterEvent = new MouseEvent("mouseenter", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        actualSkull.dispatchEvent(mouseEnterEvent);
      }

      isOverSkull = true;
      return; // mouseenter 이벤트가 정상적으로 발생하도록 여기서 멈춤
    }

    // skull 영역 밖으로 나갔을 때
    if (isOverSkull) {
      // 커서를 다시 활성화하고 opacity를 1로 복원
      enableCursor(); // 커서 활성화 (cursorActive가 false였을 수 있으므로)
      gsap.to(hellCursor, {
        opacity: 1,
        duration: 0.2,
        ease: "power2.out",
      });

      isOverSkull = false;
    }

    if (isInsideHell1(event.clientX, event.clientY)) {
      // skull 영역이 아닐 때만 커서 활성화
      const elementsAtPointCheck = document.elementsFromPoint(
        event.clientX,
        event.clientY
      );
      const skullElementCheck = elementsAtPointCheck.find(
        (el) => el.classList.contains("skull") || el.closest(".skull")
      );

      if (
        !skullElementCheck &&
        !elementsAtPointCheck.some((el) => el.closest(".skull-wrapper"))
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

    // skull 영역에서는 드래그 상태 완전 초기화
    const elementUnderPointer =
      event.target?.closest?.(".skull") ||
      event.target?.closest?.(".skull-wrapper");
    if (elementUnderPointer) {
      cursorDragging = false;
      // disableCursor() 제거 - skull 클릭해도 커서는 유지 (handlePointerMove에서 opacity로 제어)
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

  // pointerdown, pointerup은 document 레벨에서 등록 (스크롤 기능을 위해)
  // skull 영역은 handlePointerDown 내부에서 체크하여 제외
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("pointerup", handlePointerUp);
  document.addEventListener("pointercancel", handlePointerUp);

  // pointermove는 document 레벨에서 등록 (커서 추적 및 드래그 스크롤을 위해)
  document.addEventListener("pointermove", handlePointerMove);

  window.addEventListener("blur", () => {
    handlePointerUp();
    disableCursor();
  });

  window.addEventListener("pointerleave", () => {
    handlePointerUp();
    disableCursor();
  });

  // 🔥 어떤 UI를 클릭하든 드래그 상태가 남지 않도록 완전 초기화
  document.addEventListener("click", () => {
    cursorDragging = false;
    hellCursor.classList.remove("is-active", "is-pressed");
    setCursorOffset(0);
    setLowerScale(1);
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
    modalOverlay.style.pointerEvents = "auto"; // 모달 열 때 pointer-events 활성화
    if (modalContent) {
      modalContent.style.pointerEvents = "auto";
    }

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
    // 모달 닫기 시작 시 즉시 pointer-events 비활성화
    modalOverlay.style.pointerEvents = "none";
    if (modalContent) {
      modalContent.style.pointerEvents = "none";
    }

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

function initFireParticles() {
  const canvas = document.querySelector(".fire-particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const particles = [];
  let mouseX = -1000;
  let mouseY = -1000;
  let animationId;

  // Canvas 크기 설정 (hell-2-wrapper 크기에 맞춤)
  const resizeCanvas = () => {
    const wrapper = document.querySelector(".hell-2-wrapper");
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // 간단한 Perlin Noise 대신 사용할 랜덤 함수
  const noise = (() => {
    const p = new Array(512);
    const permutation = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
    ];
    for (let i = 0; i < 256; i++) {
      p[256 + i] = p[i] = permutation[i % 32];
    }
    return (x, y) => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const a = p[p[X] + Y];
      const b = p[p[X + 1] + Y];
      const c = p[p[X] + Y + 1];
      const d = p[p[X + 1] + Y + 1];
      return a + (b - a) * u + (c - a) * v + (d - b - c + a) * u * v + 0.5;
    };
  })();

  // 파티클 클래스
  class Particle {
    constructor() {
      this.reset();
      this.y = canvas.height * 0.95;
    }

    reset() {
      // 하단 넓은 영역에서 생성 (위로 올라가도록, 조금 더 상단에서 시작)
      this.x = Math.random() * canvas.width * 0.7; // 왼쪽 0~70% 영역 (더 넓게)
      // 하단에서 생성하되, 조금 더 상단에서 시작
      this.y = canvas.height * 0.75 + Math.random() * canvas.height * 0.15; // 하단 75~90%에서 생성

      // 아래에서 대각선 위로 이동하는 기본 방향 (1.5배 빠르게)
      const baseSpeed = (0.1 + Math.random() * 0.15) * 1.5;
      const baseAngle = 45 + (Math.random() - 0.5) * 20; // 35~55도 대각선 위 방향
      const angleRad = baseAngle * (Math.PI / 180);
      this.vx = baseSpeed * Math.cos(angleRad);
      this.vy = -baseSpeed * Math.sin(angleRad); // 위로 이동 (음수)

      // 가느다란 파티클 (크기와 길이 랜덤)
      this.size = (0.5 + Math.random() * 1) * 1.5;
      this.length = (3 + Math.random() * 5) * 1.5; // 파티클 길이

      // 랜덤 오퍼시티
      this.opacity = 0.4 + Math.random() * 0.4; // 최소 0.4로 보이도록
      this.life = 1.0;
      this.decay = 0.00003 + Math.random() * 0.00005; // 매우 천천히 감소
      // 시작 시간 기록 (페이드인용)
      this.startTime = Date.now();

      // Perlin Noise 오프셋 (각 파티클마다 다른 패턴)
      this.noiseOffsetX = Math.random() * 1000;
      this.noiseOffsetY = Math.random() * 1000;
      this.noiseOffsetZ = Math.random() * 1000; // 시간 축

      // 부드러운 이동을 위한 속도 감쇠
      this.vxDecay = 0.98;
      this.vyDecay = 0.98;
    }

    update() {
      // Perlin Noise 기반 자연스러운 곡선 무빙
      // 시간 축 추가로 더 유기적인 움직임
      this.noiseOffsetZ += 0.002;

      // 좌우 이동 (X축)
      const noiseX = noise(this.noiseOffsetX, this.noiseOffsetZ) * 2 - 1;
      // 상하 이동 (Y축)
      const noiseY = noise(this.noiseOffsetY, this.noiseOffsetZ) * 2 - 1;

      // Noise 오프셋 업데이트 (부드러운 변화)
      this.noiseOffsetX += 0.003;
      this.noiseOffsetY += 0.003;

      // 속도 업데이트 (좌우 + 상하 이동 결합, 갑작스러운 변화 없이)
      const smoothness = 0.15; // 부드러움 정도
      this.vx += noiseX * smoothness * 0.02;
      this.vy += noiseY * smoothness * 0.02;

      // 기본 방향 유지 (대각선 위로, 1.5배 빠르게)
      const baseAngle = 45 * (Math.PI / 180);
      const baseVx = 0.15 * 1.5 * Math.cos(baseAngle);
      const baseVy = -0.15 * 1.5 * Math.sin(baseAngle);
      // 부드럽게 기본 방향으로 복귀 (y축 이동량 강화)
      this.vx = this.vx * 0.85 + baseVx * 0.15;
      this.vy = this.vy * 0.8 + baseVy * 0.2;

      // 속도 감쇠 (부드러운 감속)
      this.vx *= this.vxDecay;
      this.vy *= this.vyDecay;

      // 최대 속도 제한 (너무 빠르지 않게, 1.5배 빠르게)
      const maxSpeed = 0.3 * 1.5;
      const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (currentSpeed > maxSpeed) {
        this.vx = (this.vx / currentSpeed) * maxSpeed;
        this.vy = (this.vy / currentSpeed) * maxSpeed;
      }

      // 최소 속도 유지 (완전히 멈추지 않게, 위로 이동 방향 유지, 1.5배 빠르게)
      const minSpeed = 0.02 * 1.5;
      if (currentSpeed < minSpeed && currentSpeed > 0) {
        this.vx = (this.vx / currentSpeed) * minSpeed;
        // vy는 항상 음수로 유지 (위로 이동)
        this.vy =
          Math.abs(this.vy) > 0
            ? (this.vy / currentSpeed) * minSpeed
            : -minSpeed * 0.7;
      }

      // vy가 양수가 되면 반전 (반사 개념)
      if (this.vy > 0) {
        this.vy *= -1; // 반사 개념
      }

      // 위치 업데이트
      this.x += this.vx;
      this.y += this.vy;

      // hell-2 이미지 영역 경계 처리
      if (this.x < 0) this.x = canvas.width - 1;
      if (this.x >= canvas.width) this.x = 0;
      // 생명력 감소
      this.life -= this.decay;

      // 위로 나가면 하단에서 다시 생성 (생명력과 관계없이 즉시 리셋)
      if (this.y < 0) {
        this.reset();
        this.startTime = Date.now(); // 시작 시간 재설정
        return;
      }
      // 아래로 나가면 하단에서 다시 생성 (생명력과 관계없이 즉시 리셋)
      if (this.y >= canvas.height) {
        this.reset();
        this.startTime = Date.now(); // 시작 시간 재설정
        return;
      }

      // 생명력이 끝나면 새 위치에서 다시 생성 (무한 생성)
      if (this.life <= 0) {
        this.reset();
        // 리셋 시 시작 시간도 다시 설정
        this.startTime = Date.now();
      }
    }

    draw() {
      // 시작 후 2초 동안 페이드인 (오퍼시티 0 → 1)
      const elapsed = (Date.now() - this.startTime) / 1000; // 초 단위
      const fadeInDuration = 2.0; // 2초
      let fadeInMultiplier = 1.0;

      if (elapsed < fadeInDuration) {
        // 2초 이내: 0에서 1로 페이드인
        fadeInMultiplier = elapsed / fadeInDuration;
      }

      // 랜덤 오퍼시티와 생명력에 따른 투명도
      const alpha = this.opacity * this.life * fadeInMultiplier;

      // 투명도가 너무 낮으면 그리지 않음
      if (alpha < 0.01) return;

      ctx.save();
      ctx.globalAlpha = alpha;

      // 가느다란 파티클 그리기 (물속 생물처럼, hell-2 이미지와 같은 위치)
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(this.x, this.y); // hell-2 이미지와 같은 위치
      ctx.rotate(angle);

      // 흰색 그라데이션 (중앙이 밝고 끝이 투명)
      const gradient = ctx.createLinearGradient(
        -this.length / 2,
        0,
        this.length / 2,
        0
      );

      gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
      gradient.addColorStop(0.3, `rgba(255, 255, 255, ${alpha * 0.6})`);
      gradient.addColorStop(0.7, `rgba(255, 255, 255, ${alpha * 0.6})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-this.length / 2, -this.size / 2, this.length, this.size);

      ctx.restore();
    }
  }

  // 파티클 생성 (초기 일부만 생성, 나머지는 시간이 지나면서 계속 생성)
  const initialCount = 50; // 초기 생성 개수
  for (let i = 0; i < initialCount; i++) {
    particles.push(new Particle());
  }

  // 시간이 지나면서 계속 파티클 생성
  let lastSpawnTime = Date.now();
  const spawnInterval = 100; // 100ms마다 새 파티클 생성
  const maxParticles = 300; // 최대 파티클 개수

  // 마우스 위치 추적
  const updateMouse = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };
  window.addEventListener("mousemove", updateMouse);
  window.addEventListener("mouseleave", () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  // 애니메이션 루프
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 시간이 지나면서 계속 파티클 생성
    const now = Date.now();
    if (
      now - lastSpawnTime >= spawnInterval &&
      particles.length < maxParticles
    ) {
      particles.push(new Particle());
      lastSpawnTime = now;
    }

    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    animationId = requestAnimationFrame(animate);
  };

  animate();
}
