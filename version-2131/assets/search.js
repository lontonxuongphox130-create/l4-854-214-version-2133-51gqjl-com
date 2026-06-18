(function () {
    var input = document.querySelector('[data-search-input]');
    var form = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');
    var note = document.querySelector('[data-search-note]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function card(item) {
        return [
            '<a class="movie-card" href="' + escapeHtml(item.url) + '" data-title="' + escapeHtml(item.title) + '" data-region="' + escapeHtml(item.region) + '" data-type="' + escapeHtml(item.type) + '" data-year="' + escapeHtml(item.year) + '" data-genre="' + escapeHtml(item.genre) + '" data-tags="' + escapeHtml(item.tags) + '">',
            '    <div class="poster-box">',
            '        <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '        <span class="poster-type">' + escapeHtml(item.type) + '</span>',
            '    </div>',
            '    <div class="movie-card-body">',
            '        <h3>' + escapeHtml(item.title) + '</h3>',
            '        <p>' + escapeHtml(item.oneLine) + '</p>',
            '        <div class="movie-meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
            '        <div class="movie-tags">' + escapeHtml(item.genre) + '</div>',
            '    </div>',
            '</a>'
        ].join('');
    }

    function runSearch(value) {
        var keyword = normalize(value);
        var list = Array.isArray(window.MOVIE_INDEX) ? window.MOVIE_INDEX : [];
        var matches = list.filter(function (item) {
            if (!keyword) {
                return false;
            }
            return normalize([
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.tags,
                item.oneLine
            ].join(' ')).indexOf(keyword) !== -1;
        }).slice(0, 96);

        if (!results || !note) {
            return;
        }

        if (!keyword) {
            note.textContent = '输入关键词即可检索片名、地区、类型、年份与标签。';
            results.innerHTML = '';
            return;
        }

        if (!matches.length) {
            note.textContent = '没有找到相关内容，可尝试更换片名、地区、类型或年份。';
            results.innerHTML = '<div class="empty-state">暂无匹配结果</div>';
            return;
        }

        note.textContent = '已找到相关内容，点击卡片可进入详情页。';
        results.innerHTML = matches.map(card).join('');
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input ? input.value : '';
            var next = window.location.pathname + '?q=' + encodeURIComponent(query);
            window.history.replaceState(null, '', next);
            runSearch(query);
        });
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
        input.value = initial;
        input.addEventListener('input', function () {
            runSearch(input.value);
        });
    }
    runSearch(initial);
})();
