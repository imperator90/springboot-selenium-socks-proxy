var XX = {
	tabs: {}
};
const TD_REGEX = /(thiendia\.me)|(thiendia\.cc)|(thiendia\.com)|(greenupload\.com)|(anh4\.com)|(upsieutoc\.com)|(goigai\.vip)/
const FLICKR_REGEX = /(staticflickr\.com(.*)((_o\.jpg)|(_c\.jpg)|(_l\.jpg)|(_h\.jpg)|(_k\.jpg))$)/

XX.getVideoDimensionsOf = (url) =>{
	return new Promise(function(resolve){
		// create the video element
		let video = document.createElement('video');

		// place a listener on it
		video.addEventListener( "loadedmetadata", function () {
			// retrieve dimensions
			let height = this.videoHeight;
			let width = this.videoWidth;
			// send back result
			resolve({
				height : height,
				width : width
			});
		}, false );

		// start download meta-datas
		video.src = url;
	});
}

XX.postImgToServer = function(url, tabId, width, height) {
	setTimeout(() => {
		const req = new XMLHttpRequest();
		const baseUrl = "http://xapi.foo.vn/greenupload/index.php";
		var urlObj = {
			xxx: "11xxaayymagento",
			url: url,
			width: width,
			height: height,
			title: 'AUTO listening',
			source: 'UNKNOW'
		};
		var urlParams = "";
		for (var key in urlObj) {
			if (urlParams != "") {
				urlParams += "&";
			}
			urlParams += key + "=" + encodeURIComponent(urlObj[key]);
		}
		req.open("POST", baseUrl, true);
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		req.send(urlParams);
		req.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
				XX.tabs[tabId].counter++;
			}
		}
	}, 0)
}

XX.checkImg = function(url, tabId) {
	let img = new Image();
	img.onload = function() {
		if (this.width >= 300 && this.height >= 300) {
			XX.postImgToServer(url, tabId, this.width, this.height)
		}
	}
	img.src = url;
}



chrome.webRequest.onBeforeRequest.addListener(({ tabId, url }) => {
	if (XX.tabs[tabId] == undefined) {
		XX.tabs[tabId] = {
			counter: 0
		};
	}
	
	if (!TD_REGEX.test(url) && !FLICKR_REGEX.test(url)) {
		return;
	}
	
	let xUrl = url;
	
	XX.checkImg(xUrl, tabId);
}, {
	urls: ['http://*/*', 'https://*/*'],
	types: ["image"]
}, ['blocking'])


chrome.webRequest.onBeforeRequest.addListener(({ tabId, url }) => {
	if (TD_REGEX.test(url)) {
		if (url.endsWith("popup.js") || url.endsWith("popup1.js")
			|| url.endsWith("popup2.js") || url.endsWith("popup3.js")
			|| url.endsWith("popup4.js") || url.endsWith("popup5.js")) {
			return { cancel: true };
		}
		return;
	}

}, {
	urls: ['http://*/*', 'https://*/*'],
	types: ["script"]
}, ['blocking'])