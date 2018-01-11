module.exports = {
	addHeadStyle: function (content) {
		var head = document.head || document.getElementsByTagName('head')[0],
			style = document.createElement('style');

		style.type = 'text/css';

		if (style.styleSheet) {
			style.styleSheet.cssText = content;
		} else {
			style.appendChild(document.createTextNode(content));
		}

		head.appendChild(style);
	}
};