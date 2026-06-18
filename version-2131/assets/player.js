function setupPlayer(container) {
    var video = container.querySelector('video[data-video]');
    var overlay = container.querySelector('.player-overlay');
    if (!video) {
        return;
    }

    var source = video.getAttribute('data-video');
    var hls = null;

    function bindSource() {
        if (video.getAttribute('data-ready') === '1') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        video.setAttribute('data-ready', '1');
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function startPlayback() {
        bindSource();
        hideOverlay();
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('loadedmetadata', hideOverlay);

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(setupPlayer);
});
