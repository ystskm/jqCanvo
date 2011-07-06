/*
 *  Create by Y.Sakamoto 2010/08/20
 */
$.cj.fn.mouseX = function(e){
	return e.offsetX || e.clientX-$(e.currentTarget).offset().left;
};
$.cj.fn.mouseY = function(e){
	return e.offsetY || e.clientY-$(e.currentTarget).offset().top;
};
