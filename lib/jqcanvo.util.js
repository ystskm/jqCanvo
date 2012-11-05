/*
 *  Create by Y.Sakamoto 2010/08/20
 */
$.canvo.offset = function(e) {
  e = !e.offset && e.originalEvent ? e.originalEvent: e;
  return {
    left: e.offsetX || e.clientX - $(e.currentTarget).offset().left
      + $(window).scrollLeft(),
    top: e.offsetY || e.clientY - $(e.currentTarget).offset().top
      + $(window).scrollTop()
  };
};
