(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".site-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-control.prev");
        var next = hero.querySelector(".hero-control.next");
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function move(step) {
            show(active + step);
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                move(1);
                play();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                play();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function setupCatalog() {
        var search = document.querySelector(".movie-search");
        var filter = document.querySelector(".movie-filter");
        var sort = document.querySelector(".movie-sort");
        var grid = document.querySelector(".catalog-grid");
        var empty = document.querySelector(".empty-state");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (search && initialQuery) {
            search.value = initialQuery;
        }

        function apply() {
            var query = normalize(search ? search.value : "");
            var typeValue = normalize(filter ? filter.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var typeText = normalize(card.getAttribute("data-type"));
                var okQuery = !query || haystack.indexOf(query) !== -1;
                var okType = !typeValue || typeText.indexOf(typeValue) !== -1;
                var show = okQuery && okType;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        function resort() {
            if (!sort) {
                apply();
                return;
            }
            var value = sort.value;
            var sorted = cards.slice().sort(function (a, b) {
                if (value === "title") {
                    return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                }
                var ay = parseInt(a.getAttribute("data-year") || "0", 10) || 0;
                var by = parseInt(b.getAttribute("data-year") || "0", 10) || 0;
                return by - ay;
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
            cards = sorted;
            apply();
        }

        if (search) {
            search.addEventListener("input", apply);
        }
        if (filter) {
            filter.addEventListener("change", apply);
        }
        if (sort) {
            sort.addEventListener("change", resort);
        }
        resort();
    }

    window.initMoviePlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !streamUrl) {
            return;
        }
        var loaded = false;

        function loadStream() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            loaded = true;
        }

        function start() {
            loadStream();
            overlay.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupCatalog();
    });
})();
