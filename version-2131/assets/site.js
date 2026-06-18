(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var willOpen = panel.hasAttribute('hidden');
            if (willOpen) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            toggle.setAttribute('aria-expanded', String(willOpen));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function activate(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }
        stopSlider();
        timer = window.setInterval(function () {
            activate(current + 1);
        }, 5200);
    }

    function stopSlider() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            activate(i);
            startSlider();
        });
    });

    activate(0);
    startSlider();

    var filterInput = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var clearButton = document.querySelector('[data-filter-clear]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title][data-region][data-type]'));
    var empty = document.querySelector('[data-filter-empty]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
        ].join(' '));
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(filterInput ? filterInput.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');
        var region = normalize(regionSelect ? regionSelect.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var shown = 0;

        cards.forEach(function (card) {
            var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
            var matchesType = !type || normalize(card.getAttribute('data-type')) === type;
            var matchesRegion = !region || normalize(card.getAttribute('data-region')) === region;
            var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
            var visible = matchesKeyword && matchesType && matchesRegion && matchesYear;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                shown += 1;
            }
        });

        if (empty) {
            empty.hidden = shown !== 0;
        }
    }

    [filterInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });

    if (clearButton) {
        clearButton.addEventListener('click', function () {
            if (filterInput) {
                filterInput.value = '';
            }
            if (typeSelect) {
                typeSelect.value = '';
            }
            if (regionSelect) {
                regionSelect.value = '';
            }
            if (yearSelect) {
                yearSelect.value = '';
            }
            filterCards();
        });
    }

    filterCards();
})();
