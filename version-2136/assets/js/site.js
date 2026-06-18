(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-button");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
    lists.forEach(function (list) {
      var section = list.closest("section") || document;
      var input = section.querySelector(".filter-input");
      var select = section.querySelector(".filter-select");
      var empty = section.querySelector(".filter-empty");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var type = select ? select.value.trim() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchType = !type || haystack.indexOf(type.toLowerCase()) !== -1;
          var show = matchQuery && matchType;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"type-pill\">" + escapeHtml(movie.type) + "</span>",
      "<span class=\"rating-pill\">" + escapeHtml(movie.rating) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.desc) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initSearchPage() {
    var results = document.getElementById("searchResults");
    var input = document.getElementById("searchInput");
    var hint = document.getElementById("searchHint");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }

    function render(query) {
      var term = (query || "").trim().toLowerCase();
      var data = window.SEARCH_MOVIES.filter(function (movie) {
        if (!term) {
          return movie.hot;
        }
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.desc]
          .join(" ")
          .toLowerCase()
          .indexOf(term) !== -1;
      }).slice(0, term ? 180 : 72);
      if (hint) {
        hint.textContent = term ? "已展示匹配度较高的内容。" : "热门内容已优先展示。";
      }
      results.innerHTML = data.length ? data.map(movieCard).join("") : "<p class=\"filter-empty is-visible\">没有匹配内容</p>";
    }

    var initial = getQuery();
    if (input) {
      input.value = initial;
      input.addEventListener("input", function () {
        render(input.value);
      });
    }

    document.querySelectorAll("[data-search-preset]").forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-search-preset") || "";
        if (input) {
          input.value = value;
        }
        render(value);
      });
    });

    render(initial);
  }

  function initPlayers() {
    document.querySelectorAll(".video-stage").forEach(function (stage) {
      var video = stage.querySelector("video");
      var button = stage.querySelector(".player-overlay");
      if (!video || !button) {
        return;
      }
      var url = video.getAttribute("data-video");

      function start() {
        if (!url) {
          return;
        }
        if (!video.dataset.ready) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            stage.hls = hls;
          } else {
            video.src = url;
          }
          video.dataset.ready = "1";
        }
        button.classList.add("is-hidden");
        video.controls = true;
        var play = video.play();
        if (play && play.catch) {
          play.catch(function () {});
        }
      }

      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!video.dataset.ready) {
          start();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
