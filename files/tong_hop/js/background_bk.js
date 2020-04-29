const TD_REGEX = /(thiendia\.me)|(thiendia\.cc)|(thiendia\.com)|(greenupload\.com)|(anh4\.com)|(upsieutoc\.com)/

var XX = {
	tabs: {}
};

// Clean data
XX.cleanData = () => {
	for(var key in XX.tabs) {
		let xKey = key;
		chrome.tabs.get(parseInt(xKey), (tab) => {
			if (chrome.runtime.lastError) {
				delete XX.tabs[xKey];
				return;
			}
			if (tab == undefined) {
				delete XX.tabs[xKey];
				return;
			}
		});
	}
}

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

XX.processVideo = (url, videoType) => {
	XX.getVideoDimensionsOf(url)
	.then(({width, height}) => {
		if (width < 512) {
			return;
		}
		
		if (XX.videoLinks == undefined) {
			XX.videoLinksArr = [];
			XX.videoLinks = {};
		}
		
		var rootLink = url.substr(0, url.match(XX.videoLink).index);
		if (XX.videoLinks[rootLink] != undefined) {
			return;
		}
		
		console.log('%cURL w=' + width, 'color: green;', url);
		XX.videoLinks[rootLink] = {
			type: videoType,
			width: width,
			height: height,
			url: url
		};
		XX.videoLinksArr.push(rootLink);
		
		if (XX.videoLinksArr.length > 200) {
			delete XX.videoLinks[XX.videoLinksArr.shift()];
		}
		
		localStorage.setItem("videos", JSON.stringify(XX.videoLinks));
	});
}

XX.checkImg = (url, title, tabId) => {
	setTimeout(() => {
		
		let xUrl = url;
		let validEx = /\.(th|md)\.[a-zA-Z]{3,4}$/;
		
		if (TD_REGEX.test(xUrl) && validEx.test(xUrl)) {
			let xMatch = xUrl.match(validEx);
			if (xMatch != undefined && xMatch[0] != undefined && validEx.test(xMatch[0])) {
				xUrl = xUrl.replace(validEx, xMatch[0].substr(3, xMatch[0].length))
			}
		}
		
		let img = new Image();
		img.onload = function() {
			if (this.width >= 300 && this.height >= 300) {
				setTimeout(() => {
					const req = new XMLHttpRequest();
					const baseUrl = "http://xapi.foo.vn/greenupload/index.php";
					var urlObj = {
						xxx: "11xxaayymagento",
						url: xUrl,
						width: this.width,
						height: this.height,
						title: title,
						source: XX.tabs[tabId].url
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
							//chrome.tabs.executeScript(tabId,{code:"document.title = 'My lame title!'"});
						}
					}
				}, 0)
			}
		}
		img.src = xUrl;
	}, 0);
}

// Sync setting changes from other conext parts of the extension
window.addEventListener('storage', ({ key, newValue }) => {
	console.log(key);
})

// Find Youtube Tabs and add them to the tabTracker
chrome.webRequest.onBeforeRequest.addListener(({ tabId, url }) => {
		if (TD_REGEX.test(url)) {
			XX.tabs[tabId] = {url : url, counter: 0};
		}
	
	},{
		urls: [ 'http://*/*', 'https://*/*' ],
		types: [ 'main_frame' ]
	}
)

// Add cosmetic filters to all youtube tabs
chrome.runtime.onMessage.addListener(({ action }, { tab }, sendResponse) => {
	console.log(action + " - " + tab.id);
})

chrome.webNavigation.onCompleted.addListener(function(details) {
	//chrome.tabs.executeScript(details.tabId, {code: ' if (document.body.innerText.indexOf("Cat") !=-1) { alert("Cat not found!"); }'});
	if (XX.tabs[details.tabId] == undefined) {
		return;
	}

	chrome.tabs.executeScript(details.tabId, {code: 
		"var node = document.createElement('h1'); " +
		"node.innerText = 'ookkkkkkkkkkkkkk " + XX.tabs[details.tabId].counter + "';" +
		"var contentDiv = document.getElementById('content');" +
		"contentDiv.insertBefore(node, contentDiv.childNodes[0]);"
	});
}, {
	url : [{
		hostContains: "thiendia."
	}]
});

chrome.webRequest.onBeforeRequest.addListener(({ tabId, url }) => {
	chrome.tabs.get(tabId, (tab) => {
		if (tab == undefined) {
			return;
		}
		XX.checkImg(url, tab.title, tabId);
	});
}, {
	urls: ['http://*/*', 'https://*/*'],
	types: ["image"]
}, ['blocking'])