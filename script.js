document.addEventListener('DOMContentLoaded', () => {
    // 1. Countdown Timer (15 minutes looping with persistence)
    const minEl = document.getElementById('min');
    const secEl = document.getElementById('sec');
    let timeLeft = 15 * 60;

    const savedTime = localStorage.getItem('countdownTime');
    const saveTime = localStorage.getItem('countdownTimestamp');
    
    if (savedTime && saveTime) {
        const passedTime = Math.floor((Date.now() - parseInt(saveTime)) / 1000);
        timeLeft = parseInt(savedTime) - passedTime;
        if (timeLeft <= 0) timeLeft = 15 * 60;
    }

    function updateTimer() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        
        minEl.textContent = m < 10 ? '0' + m : m;
        secEl.textContent = s < 10 ? '0' + s : s;
        
        localStorage.setItem('countdownTime', timeLeft);
        localStorage.setItem('countdownTimestamp', Date.now());
        
        if (timeLeft > 0) {
            timeLeft--;
        } else {
            timeLeft = 15 * 60; // Reset loop back to 15 min
        }
    }
    
    setInterval(updateTimer, 1000);
    updateTimer();

    // 2. Marquee Duplication for seamless infinite looping
    const marqueeContents = document.querySelectorAll('.marquee-content');
    marqueeContents.forEach(content => {
        const html = content.innerHTML;
        content.innerHTML = html + html;
    });

    // 3. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal, .animate-slide-up');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // 4. Accordion Logic for FAQ
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isOpen = header.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.accordion-header').forEach(h => {
                h.classList.remove('active');
                h.nextElementSibling.style.maxHeight = null;
            });

            // Open if it wasn't open
            if (!isOpen) {
                header.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // 5. Custom VSL Logic with Non-linear Fake Progress
    const vslContainer = document.getElementById('vslPlayerContainer');
    const vslVideo = document.getElementById('vsl-video');
    const vslOverlay = document.getElementById('vslOverlay');
    const vslControls = document.getElementById('vslControls');
    const vslProgressFill = document.getElementById('vslProgressFill');
    let hasStarted = false;

    if (vslContainer && vslVideo) {
        // Função de progresso falso: 
        // Acelera muito o visual no início (simula que o vídeo é curto pra prender retenção), e lentifica ao longo do fim.
        // O input é o "tempo atual da vida real vs Duração Total Real do Vídeo".
        function calculateFakeProgress(realTime, totalDuration) {
            if (!totalDuration || totalDuration === 0) return 0;
            const fraction = realTime / totalDuration;
            
            // Primeiros 25% do tempo real vão representar visualmente 65% da barra
            if (fraction <= 0.25) {
                return (fraction / 0.25) * 65;
            } else {
                // Os 75% restantes do video lentamente enchem os últimos 35% da barra
                return 65 + ((fraction - 0.25) / 0.75) * 35;
            }
        }

        // Timer event to hook up the smart progress bar logic
        vslVideo.addEventListener('timeupdate', () => {
            if (!hasStarted) return; 
            const percent = calculateFakeProgress(vslVideo.currentTime, vslVideo.duration);
            vslProgressFill.style.width = `${percent}%`;
        });

        // Click over the whole container deals with logic gracefully
        vslContainer.addEventListener('click', () => {
            if (!hasStarted) {
                // Inicialização (Primeiro clique): remove bloqueios e muta 
                hasStarted = true;
                vslOverlay.style.display = 'none';
                vslControls.classList.remove('hidden');
                
                vslVideo.muted = false;
                vslVideo.loop = false;
                vslVideo.currentTime = 0; // Reinicia exato pro segundo 0
                
                // Play wrapper for strict mobile engines
                const playPromise = vslVideo.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => console.log('Autoplay play exception:', e));
                }
            } else {
                // Durante assitir: Pausa/Continua on click
                const vslCenterPlay = document.getElementById('vslCenterPlay');
                if (vslVideo.paused) {
                    vslVideo.play();
                    vslContainer.classList.remove('is-paused');
                } else {
                    vslVideo.pause();
                    vslContainer.classList.add('is-paused');
                }
            }
        });
    }
});
