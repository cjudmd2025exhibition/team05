// GSAP ScrollTrigger 패럴랙스 애니메이션
document.addEventListener('DOMContentLoaded', function() {
    // GSAP와 ScrollTrigger CDN 로드 확인
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP 또는 ScrollTrigger가 로드되지 않았습니다.');
        return;
    }

    // ScrollTrigger 등록
    gsap.registerPlugin(ScrollTrigger);

    // 기존 IntersectionObserver 애니메이션 (다른 섹션용)
    const observerOptions = {
        root: null,
        rootMargin: '200px 200px 200px 200px',
        threshold: 0.01
    };

    const animateElements = (entries) => {
        entries.forEach(entry => {
            const element = entry.target;
            console.log('Element intersecting:', element, entry.isIntersecting);
            
            if (entry.isIntersecting) {
                element.classList.add('fade-in');
                console.log('Added fade-in to:', element);
            } else {
                element.classList.remove('fade-in');
            }
        });
    };

    const observer = new IntersectionObserver(animateElements, observerOptions);

    // 관찰할 요소들 등록 (패럴랙스 레이어 제외)
    const circleItems = document.querySelectorAll('.circle-item');
    const descriptionPs = document.querySelectorAll('.hero-description p');
    const fadeTexts = document.querySelectorAll('.fade-text');
    const slideUpElements = document.querySelectorAll('.slide-up-fade');
    
    // Circle 요소들은 hero 섹션 내에 있으므로 hero 섹션이 보이면 즉시 표시
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        // 페이지 로드 시 이미 hero 섹션이 보이는 경우 체크
        const checkHeroVisible = () => {
            const rect = heroSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                circleItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('fade-in');
                    }, index * 200);
                });
                return true;
            }
            return false;
        };
        
        // 즉시 체크
        if (!checkHeroVisible()) {
            // 보이지 않으면 IntersectionObserver 사용
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Hero 섹션이 보이면 circle 요소들에 fade-in 추가
                        circleItems.forEach((item, index) => {
                            setTimeout(() => {
                                item.classList.add('fade-in');
                            }, index * 200);
                        });
                        // 한 번만 실행되도록 관찰 중단
                        heroObserver.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            });
            heroObserver.observe(heroSection);
        }
    } else {
        // Hero 섹션을 찾을 수 없으면 기본 observer 사용
        circleItems.forEach(item => observer.observe(item));
    }
    
    descriptionPs.forEach(p => observer.observe(p));
    fadeTexts.forEach(text => observer.observe(text));
    slideUpElements.forEach(element => observer.observe(element));

    // About 섹션 애니메이션
    const aboutSection = document.querySelector('.about');
    console.log('About section found:', aboutSection);
    let aboutAnimated = false;
    
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            console.log('About section intersecting:', entry.isIntersecting);
            if (entry.isIntersecting && !aboutAnimated) {
                aboutAnimated = true;
                console.log('About animation triggered');
                
                const rightChars = document.querySelectorAll('.group-right .animate-char');
                console.log('Right chars found:', rightChars.length);
                rightChars.forEach((char, index) => {
                    setTimeout(() => {
                        char.classList.add('fade-in');
                        console.log('Added fade-in to right char:', char);
                    }, index * 100);
                });
                
                const rightTexts = document.querySelectorAll('.group-right .fade-text');
                rightTexts.forEach((text, index) => {
                    setTimeout(() => {
                        text.classList.add('fade-in');
                    }, (rightChars.length * 100) + 300 + (index * 200));
                });
                
                const leftChars = document.querySelectorAll('.group-left .animate-char');
                leftChars.forEach((char, index) => {
                    setTimeout(() => {
                        char.classList.add('fade-in');
                    }, (rightChars.length * 100) + 800 + (index * 100));
                });
                
                const leftTexts = document.querySelectorAll('.group-left .fade-text');
                leftTexts.forEach((text, index) => {
                    setTimeout(() => {
                        text.classList.add('fade-in');
                    }, (rightChars.length * 100) + 800 + (leftChars.length * 100) + 300 + (index * 200));
                });
                
                slideUpElements.forEach((element, index) => {
                    setTimeout(() => {
                        element.classList.add('fade-in');
                    }, 2500 + (index * 150));
                });
            }
        });
    }, {
        root: null,
        rootMargin: '100px 0px 100px 0px',
        threshold: 0.01
    });
    
    if (aboutSection) {
        aboutObserver.observe(aboutSection);
    }

    // 한자 섹션 애니메이션
    const hanjaSection = document.querySelector('.hanja-wisdom-section');
    const hanjaCards = document.querySelectorAll('.hanja-card');
    let hanjaAnimated = false;

    const hanjaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hanjaAnimated) {
                hanjaAnimated = true;
                
                const inkPattern = document.querySelector('.ink-pattern-bg');
                if (inkPattern) {
                    inkPattern.style.animation = 'inkFlow 20s infinite linear';
                }
                
                hanjaCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('fade-in');
                        
                        const blurTexts = card.querySelectorAll('.blur-text');
                        blurTexts.forEach((text, textIndex) => {
                            setTimeout(() => {
                                text.style.filter = 'blur(0px)';
                                text.style.opacity = '1';
                                text.style.color = '#333';
                            }, 800 + (textIndex * 300));
                        });
                        
                    }, index * 400);
                });
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.2
    });

    if (hanjaSection) {
        hanjaObserver.observe(hanjaSection);
    }

    // 기존 패럴랙스 효과 (다른 요소들용)
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-image');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });

        // PNG 이미지 색상 변경 효과
        const aboutSection = document.querySelector('.about');
        
        if (aboutSection) {
            const aboutTop = aboutSection.offsetTop;
            const aboutBottom = aboutTop + aboutSection.offsetHeight;
            
            if (scrolled >= aboutTop && scrolled <= aboutBottom) {
                document.documentElement.style.setProperty('--bg-blend-mode', 'difference');
            } else {
                document.documentElement.style.setProperty('--bg-blend-mode', 'normal');
            }
        }
    });

    // 성능 최적화: 스크롤 이벤트 정리
    window.addEventListener('beforeunload', () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    });
});