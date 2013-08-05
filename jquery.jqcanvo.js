;
jQuery.canvo
  && jQuery.canvo.version
  || (function($) {

    //debug function set (client only version) >>
    var util, debug, DEBUG_CATEGORY = 'jqCanvo', FILE_NAME;
    util = console, debug = window.JS_DEBUG, FILE_NAME = 'xjQuery';
    if(debug
      && (debug == 'true' || (new RegExp(DEBUG_CATEGORY + '|' + FILE_NAME)
          .test(debug)))) {
      debug = function(s) {
        util.error(FILE_NAME + '.js : ' + (typeof s == 'function' ? s(): s));
      };
    } else
      debug = function() {
      };
    // << function debug() is available.

    // set to define getter
    var getters = {
      version: '0.2.0',
      available: true
    };

    // constants
    var Constants = {
      Instance: 'canvoInstance',
      Layers: 'canvoLayers'
    };

    $.canvo = $.fn.canvo = function(option) {
      if(getters.available === false)
        return null;
      return new $.canvo.fn.init(this, option);
    };

    // event emitter
    $.canvo.fn = $.canvo.prototype = {
      init: function(canvas, options) {

        options = $.extend({
          initialize: false,
          maxstep: 0
        }, options);

        this.instance = this;

        this.events = {}, this.event_ids = {};
        // general object
        try { // canvas permits both jQuery-object and DOM-object. 
          this.canvas = canvas.get(0);
          this.$canvas = canvas.eq(0);
        } catch(e) {
          this.canvas = canvas;
          this.$canvas = $(canvas);
        }

        if(this.$canvas.data(Constants.Instance) && !options.initialize)
          return this.instance;

        var opt_attr = {};
        if(options.id)
          opt_attr.id = options.id;
        if(options.width)
          opt_attr.width = options.width;
        if(options.height)
          opt_attr.height = options.height;

        this.$canvas.attr(opt_attr);

        this.id = this.$canvas.attr('id');
        this.classes = this.$canvas.attr('class');
        this.styles = this.$canvas.attr('style');

        this.width = this.$canvas.width() || parseInt(this.canvas.width)
          || opt_attr.width;
        this.height = this.$canvas.height() || parseInt(this.canvas.height)
          || opt_attr.height;
        this.position = this.$canvas.css('position');
        this.maxstep = options.maxstep;

        var selector = this.$canvas.selector;
        if(this.$canvas.length == 0)
          throw new Error('No object selected. selector: ' + selector);

        if(this.id == null)
          throw new Error('No id in object. selector: ' + selector);

        if(!(this.width && this.height))
          throw new Error('width and height must be set. id : ' + this.id);

        if(!this.container) { // new 

          this.container = $('<div/>').width(this.width).height(this.height);

          if(this.position == 'static') {
            console.warn('canvas position will set to "relative". id : '
              + this.id);
            this.container.css('position', 'relative');
          } else
            this.container.css('position', this.position);

          if(this.id)
            this.container.attr('id', this.id);
          if(this.classes)
            this.container.addClass(this.classes);
          if(this.styles)
            this.container.attr('style', this.style);

          this.parent = this.$canvas.parent();
          var index = this.parent.children().index(this.canvas);

          // remove from dom tree.
          this.$canvas.remove();

          if(this.parent.children().length)
            this.parent.children().eq(index).before(this.container);
          else
            this.parent.append(this.container);
        }

        // instance set
        this.$canvas.data(Constants.Instance, this);

        // LayerIdx initialize
        this.LayerIdx = 0;
        this.layers = [];

        this.ExLayerIdx = 0;
        this.exLayers = [];

        // first layer
        this.addLayer();

        // layers set
        this.$canvas.data(Constants.Layers, this.layers);

        return this.instance;
      }
    };

    //Give the init function the canvobase prototype for later instantiation
    $.canvo.fn.init.prototype = $.canvo.fn;

    // test compatibility
    var pseudo = $('<canvas/>').get(0);
    if(!$.isFunction(pseudo.getContext))
      return getters.available = false;

    // for getting context prototype 
    var context = pseudo.getContext('2d');

    // original functions
    var extend = {
      noConflict: function(deep) {
        $.canvo = _$.canvo;
        if(deep) {
          window.$.canvo = _$.canvo;
        }
        return $.canvo;
      },
      select: function(index) {
        if(index == null)
          return this.LayerIdx;
        return this.LayerIdx = index, this;
      },
      getLayerIdx: function() {
        console.warn('deprecated. use select().');
        return this.LayerIdx;
      },
      getLayerLength: function() {
        return this.layers.length;
      },
      getLayer: function(index) {
        return (index == null) ? this.layers[this.LayerIdx]: this.layers[index];
      },
      addLayer: function(options) {
        options = $.extend({
          extra: false,
          count: 1
        }, parseInt(options) ? {
          count: options
        }: typeof options == 'boolean' ? {
          extra: options
        }: options);

        for( var i = 0; i < options.count; i++) {
          // create
          var newLayer = createLayer(this.$canvas, this.container);

          // set index
          if(options.extra)
            this.ExLayerIdx = this.exLayers.push(newLayer) - 1;
          else
            this.LayerIdx = this.layers.push(newLayer) - 1;
        }
        return this;
      },
      delLayer: function(index, extra) {
        extra ? this.exLayers.splice(index, 1): this.layers.splice(index, 1);
      },
      getContainer: function() {
        return this.container;
      },
      getSize: function() {
        return {
          width: this.width,
          height: this.height
        };
      },
      getCanvas: function(index) {
        return this.getLayer(index).canvas;
      },
      getjQueryWrapped: function(index) {
        return this.getLayer(index).$canvas;
      },
      getContext: function(index) {
        return this.getLayer(index).context;
      },
      getPaths: function(index) {
        return this.getLayer(index).paths;
      },
      beginPath: function(options) {
        var self = this;
        options = $.extend({}, options);
        var layer = options['Layer'];

        delete options['Layer'];
        draw.call(this, function(ctx) {
          self.select(layer);
          styleChange(ctx, options), ctx.beginPath();
        });
        return this;
      },
      css: function(options) {
        options = $.extend({}, options);
        draw.call(this, function(ctx) {
          styleChange(ctx, options);
        });
        return this;
      },
      moveTo: function() {
        var self = this, paths = this.getPaths();
        var x = arguments[0], y = arguments[1], unsave = arguments[2];
        draw.call(this, function(ctx) {
          ctx.moveTo(x, y);
          paths.present.x = x, paths.present.y = y;
        }, !unsave);
        return this;
      },
      line: function() {
        var self = this;
        var args = Array.prototype.slice.call(arguments);
        var mx = null, my = null, x, y;
        if(args.length == 4)
          mx = args.shift(), my = args.shift();
        x = args[0], y = args[1];
        draw.call(this, function(ctx) {
          if(!(mx == null || my == null))
            ctx.moveTo(mx, my);
          ctx.lineTo(x, y);
        });
        return this;
      },
      arc: function() {
        var self = this;
        var args = Array.prototype.slice.call(arguments);
        var mx = null, my = null, ox, oy, r, sA, eA, cl = false;
        if(typeof args.slice(-1)[0] == 'boolean')
          cl = args.pop();
        switch(args.length) {
        case 6:
          mx = args.shift(), my = args.shift();
          ox = args[0], oy = args[1], sA = args[2], eA = args[3];
          break;
        case 5:
          ox = args[0], oy = args[1], r = args[2], sA = args[3], eA = args[4];
          break;
        }

        // calc radius
        if(!r)
          r = calcRad(mx, my, ox, oy);

        // calc angular
        sA = toAng(sA), eA = toAng(eA);

        draw.call(this, function(ctx) {
          if(!(mx == null || my == null))
            ctx.moveTo(mx, my);
          ctx.arc(ox, oy, r, sA, eA, cl);
        });
        return this;
      },
      bezier: function() { // multi pattern args
        var self = this;
        var args = Array.prototype.slice.call(arguments);
        var mx = null, my = null;
        var bbx, bby, ebx, eby, edx, edy;
        if(args.length == 8) {
          mx = args.shift();
          my = args.shift();
        }
        bbx = args[0], bby = args[1];
        ebx = args[2], eby = args[3];
        edx = args[4], edy = args[5];
        draw.call(this, function(ctx) {
          if(!(mx == null || my == null))
            ctx.moveTo(mx, my);
          ctx.bezierCurveTo(bbx, bby, ebx, eby, edx, edy);
        });
        return this;
      },
      rotate: function(deg) {
        var ang = toAng(deg), paths = this.getPaths();
        paths.present.r += deg, draw.call(this, function(ctx) {
          ctx.rotate(ang);
        });
        return this;
      },
      clear: function(options) {

        var self = this, trigger = true, r = self.getPaths().present.r;
        if(typeof options == 'boolean') {
          trigger = false, options = {
            unsave: options,
            path: false
          };
        } else
          options = $.extend({
            unsave: false,
            path: false
          }, options);

        if(options.path == true)
          self.getLayer().paths = getInitPaths(), options.unsave = true;
        if(options.unsave != true)
          self.getPaths().rstep = [];

        draw.call(this, function(ctx) {
          ctx.rotate(toAng(r * -1));
          ctx.clearRect(0, 0, self.width, self.height);
        }, !options.unsave);

        if(trigger == true)
          this.trigger('clear', null, [this]);

        return this;
      },
      clearAll: function(unsave) {
        var self = this, pidx = this.select();
        this.layers.forEach(function(layer, idx) {
          self.select(idx).clear(unsave);
        });
        return this.select(pidx), this;
      },
      undo: function(idx) {
        if(!isNaN(idx = parseInt(idx)))
          this.select(idx);
        undoPaths.call(this);
        this.trigger('undo', null, [this]);
        return this;
      },
      canUndo: function() {
        var paths = this.getPaths(), steps = paths.ustep;
        return !(steps.length == 0 || steps.length == 1 && paths.overstep);
      },
      redo: function(idx) {
        if(!isNaN(idx = parseInt(idx)))
          this.select(idx);
        redoPaths.call(this);
        this.trigger('redo', null, [this]);
        return this;
      },
      canRedo: function() {
        return this.getPaths().rstep.length;
      },
      step: function() {
        var paths = this.getPaths();
        paths.rstep = [], paths.ustep.push(paths.queue.length - 1);
        if(this.maxstep)
          cutSteps.call(this, this.maxstep);
        this.trigger('step', null, [this]);
        return this;
      },
      refresh: function() {
        this.container.empty(), delete this.instance;
        return $.canvo.fn.init.call(this, this.$canvas, {
          initialize: true
        });
      },
      text: function(t, options) {
        var ctx = this.getContext(), paths = this.getPaths();
        options = $.extend({
          type: 'fill',
          x: paths.present.x,
          y: paths.present.y,
          maxWidth: null
        }, options);
        var args = [t, options.x, options.y];
        if(options.maxWidth)
          args.push(options.maxWidth);
        switch(options.type) {
        case 'fill':
          ctx.fillText.apply(ctx, args);
          break;
        case 'stroke':
          ctx.strokeText.apply(ctx, args);
          break;
        default:
          ctx.fillText.apply(ctx, args);
          ctx.strokeText.apply(ctx, args);
        }
        return this;
      },
      draw: function() {
        var ctx = this.getContext();
        ctx.fill(), ctx.stroke();
        return this;
      },
      trigger: function(name, num, args) {
        this.getLayer(num).$canvas.trigger(name, args);
      },
      data: function(name) {
        switch(name) {
        case 'events':
          return this.events;
        }
      },
      on: function(names, num, fn, evid) {
        var self = this, evs = this.events, evids = this.event_ids;
        names.split(' ').forEach(
          function(name) {
            var myevid = evid;
            if(!evs[name])
              evs[name] = {
                counter: 0
              }, evids[name] = {};
            if(!myevid) {
              myevid = Date.now().toString() + evs[name].counter;
              evs[name].counter = evs[name].counter + 1;
              evs[name][myevid] = [], evids[name][myevid] = fn;
            }
            var execFn = function() {
              var args = _toArray(arguments), e = args[0];
              var args_send = args[1] && args[1] instanceof $.Event ? args
                  .slice(1): args;
              return fn.apply(self, args_send), args_send;
            };
            if(typeof num == 'function')
              fn = num, num = self.LayerIdx;
            if(typeof num == 'boolean') {
              var i, lays = self.layers.length;
              if(num) { // bubbling
                i = lays;
                while(i--)
                  self.on(name, i, triggerNextFn(i, -1), myevid);
              } else { // capture
                i = 0;
                do {
                  self.on(name, i, triggerNextFn(i, +1), myevid);
                } while(++i < lays)
              }
            } else {
              var target = {
                dom: self.getLayer(num).$canvas,
                fn: execFn
              };
              evs[name][myevid].push(target), target.dom.bind(name, target.fn);
            }
            function triggerNextFn(idx, dirc) {
              if(dirc < 0 && idx > 0 || dirc > 0
                && self.layers.length - 1 > idx) {
                return function() {
                  var args_send = execFn.apply(self, arguments);
                  self.trigger(name, idx + dirc, args_send);
                };
              } else {
                return function() {
                  execFn.apply(self, arguments);
                };
              }
            }
          });
        return this;
      },
      resize: function(sizes) {
        /*
        var self = this;
        this.layers.forEach(function(layer) {
          layer.$canvas.css(sizes);
        });
        return this;
        */
      },
      trim: function(x, y, w, h) {
        var img = this.getImageData(x, y, w, h);
        return this.clear().putImageData(img, 0, 0);
      },
      toDataURL: function(x, y, w, h, type) {
        var img = this.getImageData(x, y, w, h);
        var canvas = $('<canvas width="' + w + 'px" height="' + h + 'px"/>')
            .get(0), ctx = canvas.getContext('2d');
        ctx.putImageData(img, 0, 0);
        return canvas.toDataURL(type);
      },
      draggable: function(fn, option) {
        var self = this;
        option = $.extend({
          show_in_normal: true,
          shape: 'circle'
        });
        fn.call(this);
        function isInCircle(x, y, ox, oy, r) {
          var dx = x - ox, dy = y - oy;
          return Math.sqrt(dx ^ 2 + dy ^ 2) < r;
        }
      },
      posCheck: function(options) {
        var paths = this.getPaths();
        options.x = parseInt(options.x) || paths.present.x;
        options.y = parseInt(options.y) || paths.present.y;
        return this;
      },
      wrap: function(fn, options) {

        var paths = this.getPaths(), queueing = options.queueing;
        var init = options.init, fill = options.fill, stroke = options.stroke;
        var move = !(options.x == paths.present.x && options.y == paths.present.y);

        // fill and stroke
        var main = {
          '11': function(ctx) {
            var res = fn.call(this, ctx);
            return this.draw(), res;
          },
          '10': function(ctx) {
            var res = fn.call(this, ctx);
            return this.fill(), res;
          },
          '01': function(ctx) {
            var res = fn.call(this, ctx);
            return this.stroke(), res;
          },
          '00': function(ctx) {
            return fn.call(this, ctx);
          }
        }[(fill == true ? '1': '0') + (stroke == true ? '1': '0')];

        // begin and move
        var exe = {
          '11': function(ctx) {
            this.beginPath(options).moveTo(options.x, options.y);
            return main.call(this, ctx);
          },
          '10': function(ctx) {
            this.beginPath(options);
            return main.call(this, ctx);
          },
          '01': function(ctx) {
            this.moveTo(options.x, options.y);
            return main.call(this, ctx);
          },
          '00': function(ctx) {
            return main.call(this, ctx);
          }
        }[(init == true ? '1': '0') + (move == true ? '1': '0')];

        return draw.call(this, exe, queueing), this;
      }
    };
    function createLayer($origin, container) {
      var newCanvas = $origin.clone().css({
        position: 'absolute',
        left: 0,
        top: 0
      }).addClass($origin.attr('id')).removeAttr('id');
      container.append(newCanvas);
      return {
        canvas: newCanvas.get(0),
        context: newCanvas.get(0).getContext("2d"),
        $canvas: newCanvas,
        paths: getInitPaths()
      };
    }
    function getInitPaths() {
      return {
        present: {
          x: 0,
          y: 0,
          z: 0,
          r: 0
        },
        queue: [],
        ustep: [],
        rstep: [],
        overstep: false
      };
    }
    var fontstock = {
      fontSize: 10,
      fontFamily: 'sans-serif'
    };
    function toAng(deg) {
      return deg * Math.PI / 180;
    }
    function calcRad(x, y, ox, oy) {
      return Math.sqrt(Math.pow(x - ox, 2) + Math.pow(y - oy, 2));
    }
    function styleChange(ctx, options) {
      for( var i in options) {
        var val = options[i];
        if('border' == i.slice(0, 6)) {
          var sp = val.split(" ");
          switch(sp.length) {
          case 3:
            ctx.strokeStyle = sp[2];
            ctx.lineWidth = sp[0].replace('px', '');
            break;
          case 2:
            ctx.strokeStyle = sp[1];
            ctx.lineWidth = sp[0].replace('px', '');
            break;
          default:
            ctx.strokeStyle = sp[0];
          }
        } else if('background' == i.slice(0, 10)) {
          if($.isArray(val))
            ctx.fillStyle = createGradient(ctx, val);
          else if('gradient(' == val.slice(0, 9) && ')' == val.slice(-1))
            ctx.fillStyle = createGradient(ctx, val.slice(9, -1));
          else
            ctx.fillStyle = val;
        } else if('color' == i) {
          ctx.fillStyle = val;
        } else if('opacity' == i.slice(0, 7)) {
          ctx.globalAlpha = options[i];
        } else if('font' == i.slice(0, 4)) {
          i = i.replace(/-(\w)/, function(a, b) {
            return b.toUpperCase();
          });
          fontstock[i] = val;
        } else if('shadow' == i.slice(-6)) {
          var sp = val.split(' ');
          ctx.shadowOffsetX = sp[0];
          ctx.shadowOffsetY = sp[1];
          ctx.shadowBlur = sp[2].replace('px', '');
          ctx.shadowColor = sp[3];
        }
      }
      var farr = new Array();
      if(fontstock['fontStyle'])
        farr.push(fontstock['fontStyle']);
      if(fontstock['fontWeight'])
        farr.push(fontstock['fontWeight']);
      if(fontstock['fontSize'])
        farr.push(parseFloat(fontstock['fontSize']) + 'px');
      if(fontstock['fontFamily'])
        farr.push("'" + $.trim(fontstock['fontFamily']) + "'");
      ctx.font = farr.join(' ');
    }
    function createGradient(ctx, grad) {
      var stat = $.isArray(grad) ? grad: $.trim(
        grad.replace(/(rgba?)\(([^\)]+)\)/g, function(a, b, c) {
          return b + '(' + c.replace(/,/g, '_') + ')';
        })).split(/,/);
      var init = $.isArray(stat[0]) ? stat[0]: $.trim(stat[0]).split(' ');
      var gradObj = ctx['create' + (init.length == 4 ? 'Linear': 'Radial')
        + 'Gradient'].apply(ctx, init);
      for( var i = 1; i < stat.length; i++) {
        var arg = $.isArray(stat[i]) ? stat[i]: $.trim(stat[i]).split(' ');
        gradObj.addColorStop(arg.shift(), arg.join(' ').replace(/_/g, ','));
      }
      return gradObj;
    }
    function cutSteps(size) {
      var paths = this.getPaths(), queue = paths.queue;
      var ustep = paths.ustep; /* rstep eq always [] */
      var over_size = ustep.length - size;
      if(over_size <= 0)
        return;
      paths.ustep = ustep.slice(over_size - 1);
      paths.overstep = true;
    }
    function undoPaths() {
      var paths = this.getPaths(), steps = paths.ustep, step;
      if(!this.canUndo())
        throw new Error('No more undo path.');
      if(step = steps.pop())
        paths.rstep.push(step);
      strokePaths.call(this, steps[steps.length - 1]);
    }
    function redoPaths() {
      var paths = this.getPaths(), steps = paths.rstep, step;
      if(!this.canRedo())
        throw new Error('No more redo path.');
      if(step = steps.pop())
        paths.ustep.push(step);
      strokePaths.call(this, step);
    }
    function strokePaths(step_index) {
      var paths = this.getPaths();
      this.clear(true);
      if(step_index > 0) {
        for( var i = 0; i <= step_index; i++)
          draw.call(this, paths.queue[i], false);
        /*
        draw.call(this, function(ctx) {
          ctx.stroke();
        }, false);*/
      }
      return this;
    }
    function draw(fn, queueing) {
      if(typeof queueing == 'undefined')
        queueing = ~this.maxstep;
      var res = fn.call(this, this.getContext());
      if(queueing)
        this.getPaths().queue.push(fn);
      return this.trigger('draw', null, [this]), res;
    }
    function _toArray(arg) {
      return Array.prototype.slice.call(arg);
    };

    // defineGetter function
    var callparameter = function(value) {
      return function() {
        return value;
      };
    };

    // defineSetter function
    var prohibitsetter = function() {
      return function() {
        console.error('forbidden action.');
        return false;
      };
    };

    // TODO performance check

    // set getters
    if(typeof xjQuery != 'undefined') {
      if(xjQuery.__defineGetter__)
        for( var i in getters) {
          xjQuery.__defineGetter__(i, callparameter(getters[i]));
          xjQuery.__defineSetter__(i, prohibitsetter());
        }
      else
        for( var i in getters)
          xjQuery[i] = getters[i];
    }

    // copy prototype
    for( var i in context.__proto__)
      $.canvo.fn[i] = (function(name, fn) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          var res = draw.call(this, function(ctx) {
            return fn.apply(ctx, args);
          });
          return name.substr(0, 3) == 'get' ? res: this;
        };
      })(i, context[i]);

    // Expose 
    $.extend($.canvo, extend);
    $.extend($.canvo.fn, extend);

  })(jQuery);
