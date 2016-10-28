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
    var i, item = {elem: elem, options: options};
    for (var key in options) {
      if(Array.isArray(options[key])) {
        for(i = 0; i < options[key].length; i++) {
          item.options[key][i].current = options[key][i].start || 0;
        }
      } else {
        item.options[key].current = options[key].start || 0;
      }
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

  function calculateTargetAndEase(transform, trigger, dist) {
    var near = transform.range[0],
        far = transform.range[1],
        range = Math.abs(far - near),
        mid = near + far / 2,
        target, easer, bounds;
    if(trigger == 'PointerX') {
      bounds = ReactiveListener.winRect.width;
    } else {
      bounds = ReactiveListener.winRect.height;
    }

    if(!transform.directional) { dist = Math.abs(dist) }

    if(dist > bounds) {
      target = far;
    } else if (dist < -bounds) {
      target = near;
    } else {
      if(transform.directional) {
        if(dist < 0) {
          target = mid - ((near - mid) * (dist / bounds));
        } else if(dist > 0){
          target = mid + ((far - mid) * (dist / bounds));
        } else {
          target = mid;
        }
      } else {
        target = near + ((far - near) * (dist / bounds));
      }
    }
    var easer = Math.min(range / 20.0, 0.05);
    return {target: target, newValue: ease(transform.current, target, easer)}
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
    var i, j, item, box, dist, trigger, changeSet, changeStrs, change,
        transforms, changed = false;
    ReactiveListener.setWindowDims(); // TODO:  Should this go here?  Or only on scroll/resize?
    if(ReactiveListener.mouse) {
      for(i = 0; i < ReactiveListener.elements.length; i++) {
        item = ReactiveListener.elements[i];
        box = item.box;
        dist = {'PointerX': calcXDist(item), 'PointerY': calcYDist(item)};
        changeStrs = {};
        for(trigger in item.options) {
          if(Array.isArray(item.options[trigger])) {
            transforms = item.options[trigger];
          }  else {
            transforms = [item.options[trigger]]
          }
          for (j = 0; j < transforms.length; j++) {
            changeSet = calculateTargetAndEase(transforms[j], trigger, dist[trigger]);
            transforms[j].current = changeSet.newValue;
            if(transforms[j].property === 'transform') {
              changeStrs['transform'] = changeStrs['transform'] || '';
              changeStrs['transform'] = changeStrs['transform'] + transforms[j].transform + '(' + changeSet.newValue + transforms[j].unit + ') ';
            } else {
              changeStrs[transforms[j].property] = '' + changeSet.newValue + transforms[j].unit;
            }
            if(changeSet.newValue != changeSet.target) {
              changed = true;
            }
          }
        }
        for(change in changeStrs) {
          item.elem.style[change]= changeStrs[change];
        }
      }
      if(changed == true) {
        window.requestAnimationFrame(ReactiveListener.render);
      }
    }

    //window.requestAnimationFrame(ReactiveListener.render);
    // TODO:  Do we ever want to not be requesting?  Probably... 
  };

  ReactiveListener.start = function() {
    document.addEventListener('mousemove', ReactiveListener.handleMouseMove);
  }

})();
