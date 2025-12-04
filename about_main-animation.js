// GSAP ScrollTrigger 패럴랙스 애니메이션
document.addEventListener('DOMContentLoaded', function() {
    // GSAP와 ScrollTrigger 로드 확인
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP 또는 ScrollTrigger가 로드되지 않았습니다.');
        return;
    }

    // ScrollTrigger 등록
    gsap.registerPlugin(ScrollTrigger);

    // 패럴랙스 컨테이너
    const parallaxContainer = document.querySelector('.parallax-container');
    if (!parallaxContainer) {
        console.warn('.parallax-container를 찾을 수 없습니다.');
        return;
    }

    // 각 레이어의 스크롤 속도 (배경이 가장 느리고, 앞으로 갈수록 빠름)
    const parallaxSpeeds = {
        'layer-bg': 0.2,           // 가장 느림 (배경)
        'layer-mini': 0.4,
        'layer-cloud-back': 0.5,
        'layer-cloud-mid': 0.7,
        'layer-cloud-front': 0.9,
        'layer-somini': 1.0,
        'layer-title': 1.2        // 가장 빠름 (앞)
    };

    // 각 레이어에 패럴랙스 효과 적용
    Object.keys(parallaxSpeeds).forEach(layerClass => {
        const layer = document.querySelector(`.${layerClass}`);
        if (!layer) return;

        const speed = parallaxSpeeds[layerClass];
        const yMovement = 800 * speed; // 훨씬 더 긴 스크롤에 맞춰 이동량 증가

        // 패럴랙스 이동 효과만 적용
        gsap.to(layer, {
            y: -yMovement,
            ease: 'none',
        scrollTrigger: {
                trigger: parallaxContainer,
            start: 'top top',
            end: 'bottom top',
                scrub: 2.5, // 훨씬 더 부드럽고 느린 스크롤링
            invalidateOnRefresh: true
        }
    });
    });

    // Title 레이어 - 스크롤에 따라 페이드 인
    const titleLayer = document.querySelector('.layer-title');
    if (titleLayer) {
        const titleTimeline = gsap.timeline({
        scrollTrigger: {
                trigger: parallaxContainer,
            start: 'top top',
            end: 'bottom top',
                scrub: 2.5,
            invalidateOnRefresh: true
        }
    });

        titleTimeline.fromTo(titleLayer, {
            opacity: 0,
            scale: 0.85
        }, {
            opacity: 1,
            scale: 1,
            ease: 'power2.out',
            duration: 0.35
        });

        titleTimeline.to(titleLayer, {
            opacity: 0,
            ease: 'power2.inOut',
            duration: 0.45
        }, 0.55);
            }

    // 성능 최적화
    const layers = gsap.utils.toArray('.parallax-layer');
    layers.forEach(layer => {
        layer.style.willChange = 'transform, opacity';
    });

    const aboutSection = document.querySelector('.about-section');
    const generalLayers = layers.filter(layer => !layer.classList.contains('layer-title'));

    if (aboutSection && layers.length) {
        const revealTimeline = gsap.timeline({
        scrollTrigger: {
                trigger: parallaxContainer,
                start: '80% bottom',
            end: 'bottom top',
                scrub: 1.8,
                invalidateOnRefresh: true,
                onUpdate: self => {
                    aboutSection.style.pointerEvents = self.progress >= 0.75 ? 'auto' : 'none';
                }
            }
        });

        if (generalLayers.length) {
            revealTimeline.to(generalLayers, {
                opacity: 0,
                ease: 'power1.inOut'
            }, 0);
        }

        revealTimeline.fromTo(aboutSection, {
            autoAlpha: 0,
            y: 140
        }, {
            autoAlpha: 1,
            y: 0,
            ease: 'power2.out'
        }, 0.45);
    }

    // About Intro 섹션 시네마틱 등장 애니메이션
    gsap.from('.about-intro__title', {
        scrollTrigger: {
            trigger: '.about-intro',
            start: 'top 80%'
        },
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: 'power2.out'
    });

    gsap.from('.about-intro__text--left p', {
        scrollTrigger: {
            trigger: '.about-intro__text--left',
            start: 'top 75%'
        },
        opacity: 0,
        x: -50,
        duration: 1.3,
        ease: 'power2.out',
        stagger: 0.18
    });

    gsap.from('.about-intro__text--right p', {
        scrollTrigger: {
            trigger: '.about-intro__text--right',
            start: 'top 75%'
        },
        opacity: 0,
        x: 50,
        duration: 1.3,
        ease: 'power2.out',
        stagger: 0.18
    });

    // About Content 섹션 모던 인터랙션
    const aboutContentSections = gsap.utils.toArray('.about-content-section');

    aboutContentSections.forEach(section => {
        const textTargets = section.querySelectorAll('.about-content__title, .about-content__quote, .about-content__block');

        if (textTargets.length) {
            gsap.from(textTargets, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%'
                },
                opacity: 0,
                y: 50,
                duration: 1.1,
                ease: 'power2.out',
                stagger: 0.18
            });
        }
    });

    // Digital Judges 섹션 카드 등장 애니메이션
    // 기존 GSAP transform(y) 애니메이션이 CSS hover/float transform과 충돌해서
    // 카드 위아래 모션과 hover 효과가 끊기는 문제가 있어, 이 구간은 비활성화합니다.
    // 필요하면 추후에 wrapper 요소를 추가해서 그쪽에만 GSAP을 적용하는 방식으로 복원할 수 있습니다.
    /*
    const judgeCards = gsap.utils.toArray('.judge-card');
    
    if (judgeCards.length) {
        gsap.set(judgeCards, { opacity: 0, y: 80 });
        
        gsap.to(judgeCards, {
            scrollTrigger: {
                trigger: '.digital-judges',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            stagger: 0.15
        });
    }
    */

    // Digital Hell Section (디지털 지옥도 살펴보기) 애니메이션
    const digitalHellSection = document.querySelector('.digital-hell-section');
    if (digitalHellSection) {
        const hellTitle = digitalHellSection.querySelector('.digital-hell-section__title');
        const hellCards = gsap.utils.toArray('.hell-card');
        
        // 타이틀 애니메이션
        if (hellTitle) {
            gsap.from(hellTitle, {
        scrollTrigger: {
                    trigger: digitalHellSection,
                    start: 'top 80%'
                },
                opacity: 0,
                y: 40,
                duration: 1.2,
                ease: 'power2.out'
            });
        }
        
        // 카드 애니메이션
        if (hellCards.length) {
            gsap.set(hellCards, { opacity: 0, y: 60, scale: 0.95 });
            
            gsap.to(hellCards, {
        scrollTrigger: {
                    trigger: digitalHellSection,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.3,
                ease: 'power3.out',
                stagger: 0.12
            });
        }
    }

    // Digital Mountain Section (업의 산) 로고 애니메이션
    const digitalMountainSection = document.querySelector('.digital-mountain-section');
    if (digitalMountainSection) {
        const logo1 = document.querySelector('.logo-1');
        const logo2 = document.querySelector('.logo-2');
        const logo3 = document.querySelector('.logo-3');
        
        if (logo1 && logo2 && logo3) {
            gsap.timeline({
        scrollTrigger: {
                    trigger: '.digital-mountain-section',
                    start: 'top center',
                    toggleActions: 'play none none reverse'
                }
            })
            .to('.logo-1', {
                duration: 0.6,
                opacity: 1,
                y: 0,
                ease: 'power3.out'
            })
            .to('.logo-2', {
                duration: 0.6,
                opacity: 1,
                y: 0,
                ease: 'power3.out'
            }, '+=0.15')
            .to('.logo-3', {
                duration: 0.6,
                opacity: 1,
                y: 0,
                ease: 'power3.out'
            }, '+=0.15');
        }
    }

    // 디지털 푸터 섹션 애니메이션
    const footerSection = document.querySelector('.digital-footer-section');
    const footerInner = document.querySelector('.footer-inner');
    
    if (footerSection && footerInner) {
        gsap.timeline({
            scrollTrigger: {
                trigger: footerSection,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
        }
        })
        .to(footerInner, {
            duration: 1,
            opacity: 1,
            y: 0,
            ease: 'power3.out'
        });
    }

    // 스크롤 이벤트 정리
    window.addEventListener('beforeunload', () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    });
});
