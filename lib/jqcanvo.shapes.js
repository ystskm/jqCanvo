/*
 *  Create by Y.Sakamoto 2012/04/17
 */
(function() {
  $.extend($.canvo.fn, {
    circle: circle,
    triangle: triangle,
    square: square,
    borderArc: borderArc,
    writeGrid: writeGrid
  });
  var Default = {
    circle: {

    },
    triangle: {
      set: 'green'
    },
    square: {
      retioWH: 1
    },
    borderArc: {
      set: 'darkblue'
    },
    writeGrid: {
      'border-color': '#f0f0f0',
      'margin-left': 24,
      'margin-top': 24,
      'font-size': 12
    }
  };
  var Styles = {
    Triangle: {
      common: {
        init: true,
        fill: true,
        stroke: false,
        retioWH: (1 + Math.sqrt(5)) / 2,
        shadow: '0 0 3 #555'
      },
      green: {
        background: function(x, y, h) {
          return [[x, y, x, y - h].join(' '), '1 #65cf6a', '0.14 #94f7b4'];
        }
      },
      olive: {
        background: function(x, y, h) {
          return [[x, y, x, y - h].join(' '), '1 #aed36b', '0.14 #d6f7a0'];
        }
      }
    },
    BorderArc: {
      common: {
        init: true,
        fill: false, // force
        stroke: false,
        innerfillstyle: '#fff',
        angle: 0,
        slope: 80,
        attract: 20,
        weight: 0.5,
        weightretio: 4,
        adjuster: {
          sx: 0,
          sy: 0,
          shx: 0,
          shy: 0,
          ehx: 0,
          ehy: 0,
          ex: 0,
          ey: 0
        },
        inneradjuster: {
          shx: 0,
          shy: 0,
          ehx: 0,
          ehy: 0
        }
      },
      darkblue: {
        background: '#3374a8'
      }
    }
  };
  function writeGrid() {
    var span = arguments[0], text_span = arguments[1], options = $.extend({
      fill: false
    }, Default.writeGrid, arguments[2]);

    var w = options.w || this.width, h = options.h || this.height;
    var ml = options['margin-left'], mt = options['margin-top'];
    var fs = options['font-size'];

    return this.posCheck(options).wrap(function(ctx) {
      this.beginPath({
        'border-color': options['border-color'],
        'font-size': fs
      });
      for( var i = 0; i <= w / span; i++) {
        var gp = i * span, pos = ml + gp;
        this.line(pos, mt, pos, h);
        if(!(gp % text_span))
          this.text(gp, {
            x: pos - 2 - (String(gp).length - 1) / 2 * fs / 2,
            y: fs + 3
          });
      }
      for( var i = 0; i <= h / span; i++) {
        var gp = i * span, pos = mt + gp;
        this.line(ml, pos, w, pos);
        if(gp == 0)
          this.text('px', {
            x: ml / 2 - fs / 2,
            y: mt / 2 + fs / 5
          });
        if(!(gp % text_span))
          this.text(gp, {
            x: ml / 2 - String(gp).length / 2 * fs / 2,
            y: pos + fs / 2
          });
      }
    }, options);
  }
  function circle() {
    var r = arguments[0], options = $.extend({
      init: arguments[2],
      fill: arguments[2],
      stroke: arguments[2],
    }, Default.circle, arguments[1]);

    // old style
    if(arguments.length == 3) {
      console.warn('deprecated pattern. use circle(r, options)');
      options.x = arguments[0], options.y = arguments[1], r = arguments[2];
    }

    return this.posCheck(options).wrap(function(ctx) {
      this.arc(options.x, options.y, r, 0, 360);
    }, options);
  }

  function triangle() {
    var w = arguments[0], options = $.extend({
      init: arguments[2],
      fill: arguments[2],
      stroke: arguments[2],
    }, Default.triangle, arguments[1]);

    // set style
    if(options.set && Styles.Triangle[options.set])
      options = $.extend({}, Styles.Triangle.common,
        Styles.Triangle[options.set], options);

    this.posCheck(options);

    if(!options.h)
      options.h = w * options.retioWH;

    for( var i in options)
      if($.isFunction(options[i]))
        options[i] = options[i](options.x, options.y, options.h);

    var sx = options.x, sy = options.y, h = options.h;

    return this.wrap(function(ctx) {
      this.line(sx + w, sy).line(sx + w / 2, sy - h).closePath();
    }, options);
  }

  function square() {
    var w = arguments[0], options = $.extend({
      init: arguments[2],
      fill: arguments[2],
      stroke: arguments[2],
    }, Default.square, arguments[1]);

    this.posCheck(options);

    if(!options.h)
      options.h = w * options.retioWH;

    var sx = options.x, sy = options.y, h = options.h;

    return this.wrap(function(ctx) {
      this.rect(sx, sy, w, h);
    }, options);
  }

  function borderArc() {
    var w = arguments[0], options = $.extend({
      init: arguments[2],
      fill: false,
      stroke: arguments[2],
    }, Default.borderArc, arguments[1]);

    // set style
    if(options.set && Styles.BorderArc[options.set])
      options = $.extend({}, Styles.BorderArc.common,
        Styles.BorderArc[options.set], options);

    this.posCheck(options);

    var osx = options.x, osy = options.y, ang = toAng(options.angle);
    var isx = osx, isy = osy;
    var oex = options.x + Math.cos(ang) * w, oey = options.y + Math.sin(ang)
      * w;
    var iex = oex, iey = oey;

    var osl = toAng(options.slope), isl = toAng(options.slope - options.weight);
    var at = options.attract;
    var ohl = at / Math.cos(osl), ihl = at / Math.cos(isl);
    var oda = osl - ang, oaa = osl + ang;
    var ida = isl - ang, iaa = isl + ang;

    var oshx = osx + ohl * Math.cos(oda);
    var oshy = osy - ohl * Math.sin(oda);
    var oehx = oex - ohl * Math.cos(oaa);
    var oehy = oey - ohl * Math.sin(oaa);
    var ishx = isx + ihl * Math.cos(ida);
    var ishy = isy - ihl * Math.sin(ida);
    var iehx = iex - ihl * Math.cos(iaa);
    var iehy = iey - ihl * Math.sin(iaa);

    var wr = options.weightretio, daj = options.weight && ang ? {
      sx: (ang > 0 ? -1: 1) * options.weight * wr * Math.sin(ang),
      sy: options.weight * wr * Math.cos(ang),
      ex: (ang > 0 ? -1: 1) * options.weight * wr * Math.sin(ang),
      ey: options.weight * wr * Math.cos(ang)
    }: {
      sx: 0,
      sy: 0,
      ex: 0,
      ey: 0
    };

    var oaj = options.adjuster, iaj = $.extend(daj, options.inneradjuster);

    osx = osx + oaj.sx, osy = osy + oaj.sy;
    oshx = oshx + oaj.shx, oshy = oshy + oaj.shy;
    oex = oex + oaj.ex, oey = oey + oaj.ey;
    oehx = oehx + oaj.ehx, oehy = oehy + oaj.ehy;
    isx = isx + iaj.sx, isy = isy + iaj.sy;
    ishx = ishx + iaj.shx, ishy = ishy + iaj.shy;
    iex = iex + iaj.ex, iey = iey + iaj.ey;
    iehx = iehx + iaj.ehx, iehy = iehy + iaj.ehy;

    var act = options.stroke == true ? 'draw': 'fill';

    return this.wrap(function(ctx) {
      //this.circle(osx, osy, 1).circle(oshx, oshy, 1).circle(oehx, oehy, 1).circle(oex, oey, 1)
      this.bezier(osx, osy, oshx, oshy, oehx, oehy, oex, oey)[act]();
      this.beginPath({
        background: options.innerfillstyle
      });
      this.bezier(isx, isy, ishx, ishy, iehx, iehy, iex, iey)[act]();
      this.moveTo(iex, iey);
    }, options);
  }
  function toAng(deg) {
    return deg * Math.PI / 180;
  }
})($);
