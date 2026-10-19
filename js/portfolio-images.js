(function () {
    'use strict';

    var active = false;
    var pageLoaded = document.readyState === 'complete';
    var observer = null;

    function loadImage(image) {
        var source = image.getAttribute('data-src');
        if (!source) return;

        image.setAttribute('loading', 'eager');
        image.setAttribute('src', source);
        image.removeAttribute('data-src');
    }

    function observeImages() {
        if (!active || !pageLoaded || observer) return;

        var images = document.querySelectorAll('.bg-3 .project-media img[data-src]');
        if (!images.length) return;

        // Older browsers still wait until the portfolio is opened.
        if (!('IntersectionObserver' in window)) {
            Array.prototype.forEach.call(images, loadImage);
            return;
        }

        observer = new IntersectionObserver(function (entries) {
            if (!active || !pageLoaded) return;

            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: document.querySelector('.bg-3 .mCustomScrollBox'),
            rootMargin: '200px 0px',
            threshold: 0
        });

        Array.prototype.forEach.call(images, function (image) {
            observer.observe(image);
        });
    }

    window.portfolioImages = {
        setActive: function (isActive) {
            active = isActive;
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            observeImages();
        }
    };

    window.addEventListener('load', function () {
        pageLoaded = true;
        observeImages();
    });
}());
