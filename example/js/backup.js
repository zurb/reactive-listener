var $opener = $('[data-open-prompt]');

ReactiveListener.add($('[data-open-prompt] .glow')[0], {
    'Pointer2d': [{
        property: 'opacity',
        unit: '',
        range: [1, 0],
        maxDist: 250,
        forceMax: true,
        directional: false,
        start: 0,
        relative: 'viewport'
    },
        {
            property: 'opacity',
            unit: '',
            range: [0, 1],
            maxDist: 80,
            forceMax: false,
            directional: false,
            start: 0,
            relative: 'viewport'
        },
        {
            callback: function(opts) {
                var dist = opts.dist['Pointer2d'];
                if(dist === 0) {
                    return false;
                } else {
                    if(dist < 50) {
                        var height = ((50 - dist) / 50) * 100;
                        $('#hidden-area').css({height: height, opacity: (50 - dist)/100});
                    } else {
                        $('#hidden-area').css({height: 0, opacity: 0});
                    }
                }
            }
        }
    ]
});

ReactiveListener.start();

$opener.click(function() {
    if($opener.hasClass('open')) {
        $opener.removeClass('open');
        ReactiveListener.start();
        $('.hidden-area').animate({opacity: 0.5, height: '50px'});
    } else {
        $opener.addClass('open');
        ReactiveListener.stop();
        $('.hidden-area').animate({opacity: 1, height: '150px'});
    }
});
