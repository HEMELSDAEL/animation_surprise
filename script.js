(() => {
    const messages = [
        {
            title : "La gentilesse",
            symbol : "✦",
            text : "Tu sais, je trouve ça chouette les personnes qui savent être attentionnées sans forcément chercher à le montrer. Je trouve que ça en dit beaucoup sur quelqu'un."
        },
        {
            title: "Les petites attentions",
            symbol: "✧",
            text: "Bon, je t'avoue que j'aime bien l'idée de faire des petites choses juste pour donner le sourire. Même si c'est trois fois rien, ça me fait plaisir de le faire."
        },
        {
            title: "Le droit de souffler",
            symbol: "☾",
            text: "Entre le boulot et tout le reste, j'imagine que les journées peuvent vite passer à une vitesse folle. Alors petit rappel : t'as aussi le droit de ne rien faire et de penser un peu à toi."
        },
        {
            title: "Les petits bonheurs",
            symbol: "☼",
            text: "Un rayon de soleil, un bon verre, une série et zéro obligation… parfois, le bonheur tient à peu de choses."
        },
        {
            title: "Une petite fleur",
            symbol: "✿",
            text: "Tu vois, maintenant, quand je croise des marguerites, j'ai une petite pensée pour toi. Comme quoi, il suffit parfois d'une fleur pour penser à quelqu'un. 🌼"
        },
        {
            title: "Pour ce soir",
            symbol: "☾",
            text: "Je voulais juste ajouter une dernière petite étoile ici. Rien de particulier à dire, juste l’envie de te faire sourire un peu."
        }
    ];
    const canvas = document.getElementById("sky");
    const ctx = canvas.getContext("2d", {alpha : true});
    const modal = document.getElementById("messageModal");
    const title = document.getElementById("messageTitle");
    const text = document.getElementById("messageText");
    const symbol = document.getElementById("messageSymbol");

    const starButtons = [
        ...document.querySelectorAll(".star-node")
    ];

    let width = 0;
    let height = 0;
    let dpr = 1;

    let stars = [];
    let shootingStars = [];

    let animationId = 0;
    let lastFrame = 0;
    let previousFocus = null;

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();

        width = rect.width;
        height = rect.height;

        // Limite la résolution pour préserver les performances mobiles.
        dpr = Math.min(window.devicePixelRatio || 1, 1.7);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Davantage d'étoiles sur un grand écran.
        const count = Math.min(
            190,
            Math.floor((width * height) / 4200)
        );

        stars = Array.from({ length: count }, () => ({
            x: random(0, width),
            y: random(0, height),
            radius: random(0.35, 1.35),
            alpha: random(0.2, 0.82),
            phase: random(0, Math.PI * 2),
            speed: random(0.3, 1.4),
            gold: Math.random() > 0.72
        }));

        shootingStars = [];
        drawSky(0);
    }

    function drawSky(time){
        ctx.clearRect(0, 0, width, height);
        for (const star of stars){
            const pulse = reduceMotion
                ? 1
                : 0.72 + 0.28 * Math.sin(
                    time * 0.001 * star.speed + star.phase
                );
            ctx.globalAlpha = star.alpha * pulse;
            ctx.fillStyle = star.gold ? "#f5dca0" : "#dce8ff";

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Halo discret autour des étoiles les plus lumineuses.
            if (star.radius > 1.08) {
                ctx.globalAlpha *= 0.22;

                ctx.beginPath();
                ctx.arc(
                    star.x,
                    star.y,
                    star.radius * 3.3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
        // Apparition occasionnelle d'une étoile filante.
        if (
            !reduceMotion &&
            Math.random() < 0.003 &&
            shootingStars.length < 1
        ) {
            shootingStars.push({
                x: random(width * 0.25, width * 0.95),
                y: random(height * 0.05, height * 0.45),
                vx: -random(3.5, 6.5),
                vy: random(1.8, 3.4),
                life: 0,
                maxLife: random(24, 38)
            });
        }
        // Animation des étoiles filantes.
        for (const shooting of shootingStars) {
            shooting.life++;
            const progress = shooting.life / shooting.maxLife;
            const alpha = Math.sin(progress * Math.PI) * 0.8;
            const tail = 75;

            const gradient = ctx.createLinearGradient(
                shooting.x,
                shooting.y,
                shooting.x - shooting.vx * tail / 5,
                shooting.y - shooting.vy * tail / 5
            );
            gradient.addColorStop(
                0,
                `rgba(255, 239, 198, ${alpha})`
            );
            gradient.addColorStop(
                1,
                "rgba(255, 239, 198, 0)"
            );
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(shooting.x, shooting.y);
            ctx.lineTo(
                shooting.x - shooting.vx * tail / 5,
                shooting.y - shooting.vy * tail / 5
            );
            ctx.stroke();
            shooting.x += shooting.vx;
            shooting.y += shooting.vy;
        }
        // Suppression des étoiles filantes terminées.
        shootingStars = shootingStars.filter(
            star => star.life < star.maxLife
        );
        ctx.globalAlpha = 1;
    }

    function animate(time) {
        // Limite le rythme de dessin pour économiser les ressources.
        if (time - lastFrame > 30) {
            drawSky(time);
            lastFrame = time;
        }

        animationId = window.requestAnimationFrame(animate);
    }

    function openMessage(index, button) {
        const message = messages[index];

        if (!message) return;

        previousFocus = button || document.activeElement;

        title.textContent = message.title;
        text.textContent = message.text;
        symbol.textContent = message.symbol;

        modal.hidden = false;
        document.body.style.overflow = "hidden";

        modal.querySelector(".close-button").focus();
    }

    function closeMessage() {
        modal.hidden = true;
        document.body.style.overflow = "";

        if (
            previousFocus &&
            typeof previousFocus.focus === "function"
        ) {
            previousFocus.focus();
        }
    }

    // Chaque étoile ouvre le message correspondant à son index.
    starButtons.forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.star);
            openMessage(index, button);
        });
    });

    // Les boutons de fermeture et le fond ferment la fenêtre.
    modal.querySelectorAll("[data-close]").forEach(button => {
        button.addEventListener("click", closeMessage);
    });

    // La touche Échap permet également de fermer le message.
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !modal.hidden) {
            closeMessage();
        }

        // Garde la navigation clavier dans la fenêtre ouverte.
        if (event.key === "Tab" && !modal.hidden) {
            const focusable = [
                ...modal.querySelectorAll("button:not([disabled])")
            ];

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (
                event.shiftKey &&
                document.activeElement === first
            ) {
                event.preventDefault();
                last.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === last
            ) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    window.addEventListener("resize", resizeCanvas, {
        passive: true
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else if (!reduceMotion) {
            lastFrame = 0;
            animationId = requestAnimationFrame(animate);
        }
    });

    resizeCanvas();
    if (!reduceMotion) {
        animationId = requestAnimationFrame(animate);
    }
})();