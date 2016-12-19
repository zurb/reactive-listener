var $opener = $('[data-open-prompt]');

ReactiveListener.add($('[data-open-prompt] .glow')[0], {
  'Pointer2d': [{
    property: 'opacity',
    unit: '',
    range: [1, 0],
    maxDist: 150,
    directional: false,
    start: 0,
    relative: 'viewport'
  },
  {
    callback: function(opts) {
      var dist = opts.dist['Pointer2d'];
      if(dist === 0) {
        $(opts.item.elem).css({'opacity': 0});
        return false;
      } else {
        if(dist < 50) {
          var height = ((50 - dist) / 50) * 150;
          $('#hidden-area').css({height: height, opacity: (50 - dist)/100});
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
    $('.hidden-area').animate({opacity: 0.5, height: '150px'});
  } else {
    $opener.addClass('open');
    ReactiveListener.stop();
    $('.hidden-area').animate({opacity: 1, height: '300px'});
  }
});
