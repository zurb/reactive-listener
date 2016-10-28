(function() {
  var ReactiveListener = window.ReactiveListener = {
    elements: []
  };

  // For now use options that look something like:
  //{
  //  'PointerX': {
  //    property: 'translateX',
  //    range: ['-50%','50%'],
  //  relative: 'viewport'
  //  },
  //  'PointerY': {
  //    property: 'translateY',
  //    range: ['-10%','10%'],
  //  relative: 'viewport'
  //  },
  //}
  ReactiveListener.add = function(elem, options) {
    var item = {elem: elem, options: options};
    for (var key in options) {
      item.options[key].current = options[key].start || 0;
    }
    // TODO:  I think we'll need to do this at least on resize & scroll,
    // to account for things like fixed positioning.
    item = ReactiveListener.addLocationAndDimensions(item);
    ReactiveListener.elements.push(item);
  };


  ReactiveListener.addLocationAndDimensions = function(item) {

    // TODO:  Refactor window pieces so we can loop over elems without recalculating
    var rect = item.elem.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    item.box = {
      left: rect.left + winX,
      right: rect.left + rect.width + winX,
      top: rect.top + winY,
      bottom: rect.top + winY + rect.height
    };
    return item;
  }

  // TODO:  Look up standards
  ReactiveListener.setMouseProperties = function(event) {
    ReactiveListener.mouse = {
      x: event.x,
      y: event.y,
      pageX: event.pageX,
      pageY: event.pageY
    }
  };

  ReactiveListener.handleMouseMove = function(event) {
    // TODO:  Debounce
    ReactiveListener.setMouseProperties(event);
    window.requestAnimationFrame(ReactiveListener.render);
  };

  function ease(current, target, ease) {
    if(Math.abs(target - current) < (ease || 0.5)) {
      return target;
    }
    return current + (target - current) * ( ease || 0.05 );
  }

  function calculateTargetAndEase(item, trigger, dist) {
    var min = item.options[trigger].range[0],
        max = item.options[trigger].range[1],
        range = Math.abs(max - min),
        mid = min + ((max - min) / 2),
        target, easer, bounds;
    if(trigger == 'PointerX') {
      bounds = ReactiveListener.winRect.width;
    } else {
      bounds = ReactiveListener.winRect.height;
    }
    if(!item.options[trigger].directional) { dist = Math.abs(dist) }

    if(dist > bounds) {
      target = max;
    } else if (dist < -bounds) {
      target = min;
    } else {
      if(item.options[trigger].directional) {
        if(dist < 0) {
          target = mid - ((min - mid) * (dist / bounds));
        } else if(dist > 0){
          target = mid + ((max - mid) * (dist / bounds));
        } else {
          target = mid;
        }
      } else {
        target = min + ((max - min) * (dist / bounds));
      }
    }
    var easer = Math.min(range / 20.0, 0.05);
    return {target: target, newValue: ease(item.options[trigger].current, target, easer)}
  }

  ReactiveListener.setWindowDims = function() {
    ReactiveListener.winRect = document.body.getBoundingClientRect();
    ReactiveListener.winY = window.pageYOffset;
    ReactiveListener.winX = window.pageXOffset;
  };

  function calcYDist(item) {
    if(ReactiveListener.mouse.pageY > item.box.bottom) {
      return ReactiveListener.mouse.pageY - item.box.bottom;
    } else if(ReactiveListener.mouse.pageY < item.box.top) {
      return ReactiveListener.mouse.pageY - item.box.top;
    } else {
      return 0;
    }
  }
  function calcXDist(item) {
    if(ReactiveListener.mouse.pageX > item.box.right) {
      return ReactiveListener.mouse.pageX - item.box.right;
    } else if(ReactiveListener.mouse.pageX < item.box.left) {
      return ReactiveListener.mouse.pageX - item.box.left;
    } else {
      return 0;
    }
  }

  ReactiveListener.render = function() {
    var i, item, box, dist, trigger, changeSet, changeStr, changed = false;
    ReactiveListener.setWindowDims(); // TODO:  Should this go here?  Or only on scroll/resize?
    if(ReactiveListener.mouse) {
      for(i = 0; i < ReactiveListener.elements.length; i++) {
        item = ReactiveListener.elements[i];
        box = item.box;
        dist = {'PointerX': calcXDist(item), 'PointerY': calcYDist(item)};
        changeStr = '';
        for(trigger in item.options) {
          changeSet = calculateTargetAndEase(item, trigger, dist[trigger]);
          item.options[trigger].current = changeSet.newValue;
          changeStr = changeStr + item.options[trigger].property + '(' + changeSet.newValue + item.options[trigger].unit + ')';
          if(changeSet.newValue != changeSet.target) {
            changed = true;
          }
        }
        if(changed == true) {
          item.elem.style.transform = changeStr;
          window.requestAnimationFrame(ReactiveListener.render);
        }
      }
    }

    //window.requestAnimationFrame(ReactiveListener.render);
    // TODO:  Do we ever want to not be requesting?  Probably... 
  };

  ReactiveListener.start = function() {
    document.addEventListener('mousemove', ReactiveListener.handleMouseMove);
  }

})();