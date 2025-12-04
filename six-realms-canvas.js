// 육도윤회 인터랙티브 Canvas 구현
class SixRealmsCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.animationId = null;
    this.time = 0;
    
    // Canvas 크기 설정
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // 여섯 세계 데이터
    this.realms = [
      { 
        name: '지옥', 
        hanja: '地獄', 
        angle: 0,
        description: '고통과 괴로움의 세계\n악업의 결과로 태어나는 곳'
      },
      { 
        name: '아귀', 
        hanja: '餓鬼', 
        angle: Math.PI / 3,
        description: '갈증과 배고픔의 세계\n탐욕의 업보를 받는 곳'
      },
      { 
        name: '축생', 
        hanja: '畜生', 
        angle: 2 * Math.PI / 3,
        description: '무지와 본능의 세계\n어리석음의 결과'
      },
      { 
        name: '아수라', 
        hanja: '阿修羅', 
        angle: Math.PI,
        description: '분노와 투쟁의 세계\n질투와 시기의 업보'
      },
      { 
        name: '인간', 
        hanja: '人間', 
        angle: 4 * Math.PI / 3,
        description: '희로애락의 세계\n깨달을 수 있는 유일한 곳'
      },
      { 
        name: '천상', 
        hanja: '天上', 
        angle: 5 * Math.PI / 3,
        description: '기쁨과 평화의 세계\n선업의 결과'
      }
    ];
    
    // 별 점들 데이터
    this.stars = this.createStars(50);
    
    // 호버된 realm 추적
    this.hoveredRealm = null;
    
    // 마우스 이벤트 설정
    this.setupMouseEvents();
    
    this.animate();
  }
  
  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // 실제 크기 설정
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    // CSS 크기 설정
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    // 고해상도 설정
    this.ctx.scale(dpr, dpr);
    
    // 실제 사용할 크기
    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;
    this.centerX = this.canvasWidth / 2;
    this.centerY = this.canvasHeight / 2;
  }
  
  createStars(count) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01
      });
    }
    return stars;
  }
  
  drawBackground() {
    // Canvas 전체를 투명하게 지우기 (이전 프레임 제거)
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 배경을 새로 만들지 않음 - 투명하게 유지
    
    // 별 점들 그리기
    this.stars.forEach(star => {
      star.opacity += Math.sin(this.time * star.twinkleSpeed) * 0.1;
      star.opacity = Math.max(0.1, Math.min(0.9, star.opacity));
      
      this.ctx.save();
      this.ctx.globalAlpha = star.opacity;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }
  
  drawOrbits() {
    const baseRadius = Math.min(this.centerX, this.centerY) * 0.375;
    const radiusStep = 55;
    const widthMultiplier = 1.7;
    const heightMultiplier = 0.95;
    
    // 3개의 타원 궤도 그리기
    for (let i = 0; i < 3; i++) {
      const radius = baseRadius + (i * radiusStep);
      const width = radius * widthMultiplier;
      const height = radius * heightMultiplier;
      
      this.ctx.save();
      this.ctx.translate(this.centerX, this.centerY);
      this.ctx.rotate(this.time * 0.001 * (i + 1)); // 궤도 회전
      
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - i * 0.1})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }
  
  drawCenterText() {
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    
    // 중앙 텍스트 "六道輪廻"
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // 살짝 흔들리는 효과
    const shakeX = Math.sin(this.time * 0.003) * 2;
    const shakeY = Math.cos(this.time * 0.002) * 1;
    this.ctx.translate(shakeX, shakeY);
    
    this.ctx.fillText('六道輪廻', 0, 0);
    
    // 부제목
    this.ctx.font = '16px sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.fillText('육도윤회', 0, 35);
    
    this.ctx.restore();
  }
  
  drawRealmTexts() {
    const baseRadius = Math.min(this.centerX, this.centerY) * 0.3;
    const mousePos = this.getMousePos();
    
    this.realms.forEach((realm, index) => {
      const radius = baseRadius + 60;
      const angle = realm.angle + this.time * 0.0005;
      
      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius * 0.6;
      
      // 마우스와의 거리 계산
      const distance = Math.sqrt((mousePos.x - x) ** 2 + (mousePos.y - y) ** 2);
      const isHovered = distance < 80;
      
      // 호버된 realm 추적
      if (isHovered) {
        this.hoveredRealm = realm;
      }
      
      this.ctx.save();
      this.ctx.translate(x, y);
      
      // 항상 적용되는 기본 효과
      // 글로우 효과 (항상 적용)
      const glowIntensity = Math.sin(this.time * 0.01 + index * 0.5) * 0.2 + 0.3;
      this.ctx.shadowColor = '#ffffff';
      this.ctx.shadowBlur = 15 * glowIntensity;
      
      // 확대 효과 (항상 적용)
      const scale = 1.05 + Math.sin(this.time * 0.015 + index * 0.8) * 0.08;
      this.ctx.scale(scale, scale);
      
      // 파티클 효과 (항상 적용)
      this.drawParticles(x, y, index);
      
      // 호버 시 추가 효과
      if (isHovered) {
        // 호버 시 더 강한 글로우
        const hoverGlow = Math.sin(this.time * 0.02) * 0.4 + 0.6;
        this.ctx.shadowColor = '#FD0101';
        this.ctx.shadowBlur = 25 * hoverGlow;
        
        // 호버 시 더 큰 확대
        const hoverScale = 1.3 + Math.sin(this.time * 0.025) * 0.15;
        this.ctx.scale(hoverScale / scale, hoverScale / scale);
        
        // 호버 시 더 많은 파티클
        this.drawParticles(x, y, index, true);
      }
      
      this.ctx.fillStyle = isHovered ? '#FD0101' : '#ffffff';
      
      // 텍스트 흔들림 효과 (항상 적용)
      const shakeX = Math.sin(this.time * 0.008 + index * 1.2) * (isHovered ? 4 : 2);
      const shakeY = Math.cos(this.time * 0.006 + index * 0.9) * (isHovered ? 3 : 1.5);
      this.ctx.translate(shakeX, shakeY);
      
      // 한자 텍스트
      this.ctx.font = 'bold 18px serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(realm.hanja, 0, -10);
      
      // 한글 텍스트
      this.ctx.font = '14px sans-serif';
      this.ctx.fillStyle = isHovered ? 'rgba(253, 1, 1, 0.9)' : 'rgba(255, 255, 255, 0.8)';
      this.ctx.fillText(realm.name, 0, 10);
      
      this.ctx.restore();
    });
  }
  
  drawParticles(x, y, index, isHovered = false) {
    const particleCount = isHovered ? 16 : 8; // 호버 시 더 많은 파티클
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + this.time * 0.005;
      const radius = 40 + Math.sin(this.time * 0.01 + i) * 10;
      const particleX = Math.cos(angle) * radius;
      const particleY = Math.sin(angle) * radius;
      
      this.ctx.save();
      this.ctx.translate(particleX, particleY);
      
      // 호버 시 다른 색상
      if (isHovered) {
        this.ctx.fillStyle = `rgba(253, 1, 1, ${Math.sin(this.time * 0.02 + i) * 0.4 + 0.4})`;
      } else {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(this.time * 0.02 + i) * 0.2 + 0.2})`;
      }
      
      this.ctx.beginPath();
      this.ctx.arc(0, 0, isHovered ? 3 : 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }
  
  getMousePos() {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (this.mouseX || 0) * this.canvasWidth / rect.width,
      y: (this.mouseY || 0) * this.canvasHeight / rect.height
    };
  }
  
  setupMouseEvents() {
    // 마우스 이동 이벤트
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
    
    // 클릭 이벤트 제거됨
    
    // 마우스가 캔버스를 벗어날 때
    this.canvas.addEventListener('mouseleave', () => {
      this.mouseX = null;
      this.mouseY = null;
      this.hoveredRealm = null;
    });
  }
  
  // 클릭 관련 함수들 제거됨
  
  // 물결 효과 제거됨
  
  drawTooltip() {
    if (!this.hoveredRealm) return;
    
    const mousePos = this.getMousePos();
    const baseRadius = Math.min(this.centerX, this.centerY) * 0.3;
    const radius = baseRadius + 60;
    const angle = this.hoveredRealm.angle + this.time * 0.0005;
    
    const x = this.centerX + Math.cos(angle) * radius;
    const y = this.centerY + Math.sin(angle) * radius * 0.6;
    
    // 툴팁 위치 계산
    const tooltipX = x + 120;
    const tooltipY = y;
    
    // 툴팁 크기 계산을 위한 폰트 설정
    this.ctx.font = '14px sans-serif';
    const lines = this.hoveredRealm.description.split('\n');
    const lineHeight = 18;
    const padding = 20;
    
    // 각 줄의 너비 측정
    let maxWidth = 0;
    lines.forEach(line => {
      const textWidth = this.ctx.measureText(line).width;
      maxWidth = Math.max(maxWidth, textWidth);
    });
    
    // 최소/최대 너비 제한
    const minWidth = 200;
    const maxWidthLimit = 300;
    const tooltipWidth = Math.max(minWidth, Math.min(maxWidth + padding * 2, maxWidthLimit));
    const tooltipHeight = lines.length * lineHeight + padding * 2;
    
    this.ctx.save();
    
    // 툴팁 배경
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    
    // 둥근 모서리
    const cornerRadius = 8;
    this.ctx.beginPath();
    this.ctx.roundRect(tooltipX, tooltipY - tooltipHeight/2, tooltipWidth, tooltipHeight, cornerRadius);
    this.ctx.fill();
    this.ctx.stroke();
    
    // 그림자 효과
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    
    // 텍스트 그리기
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    lines.forEach((line, index) => {
      const textY = tooltipY - tooltipHeight/2 + padding + (index + 0.5) * lineHeight;
      const textX = tooltipX + tooltipWidth / 2;
      this.ctx.fillText(line, textX, textY);
    });
    
    this.ctx.restore();
  }
  
  animate() {
    this.time++;
    
    // 호버 상태 초기화
    this.hoveredRealm = null;
    
    this.drawBackground();
    this.drawOrbits();
    this.drawCenterText();
    this.drawRealmTexts();
    this.drawTooltip();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('six-realms-canvas');
  if (canvas) {
    window.sixRealmsCanvas = new SixRealmsCanvas('six-realms-canvas');
  }
});
