var xx = {
	total: 0,
	processed: 0,
	dataKey: 'KEY_DATA_1'
};

let TD_REGEX = /(thiendia\.me)|(thiendia\.cc)|(thiendia\.com)|(greenupload\.com)|(anh4\.com)|(upsieutoc\.com)|(goigai\.vip)/

xx.validUrl = function(urlOrPath) {
	let img = document.createElement('img');
	img.src = urlOrPath;
	urlOrPath = img.src;
	img.src = null;
	return urlOrPath;
}

xx.all = function() {
	let strData = localStorage.getItem(xx.dataKey);
	if (strData == undefined || strData == '') {
		return {};
	}
	try {
		return JSON.parse(strData);
	} catch (e) {}
	return {};
}

xx.getRedirectURL = function(url, callback) {
	let xhttp = new XMLHttpRequest();
	xhttp.onload = () => {
		callback(xhttp.responseURL);
	}
	xhttp.open('GET', url, true);
	xhttp.send();
}

xx.itemExists = function(key) {
	let list = xx.all();
	if (list[key] != undefined && list[key] != null) {
		return true;
	}
	return false;
}

xx.addItem = function(key, val) {
	let list = xx.all();
	if (list[key] != undefined && list[key] != null) {
		return false;
	}
	list[key] = val;
	localStorage.setItem(xx.dataKey, JSON.stringify(list));
	return true;
}

$(function() {
	if (TD_REGEX.test(location.href)) {
		xx.runDataForTD();
		xx.checkListLi();
		console.log("TD Page");
		document.onmouseup = null;
		setTimeout(() => {document.onmouseup = null;}, 2000);
		setTimeout(() => {
			var script = document.createElement('script');
			script.onload = function() {
			  console.log("Script loaded and ready");
			};
			script.src = "http://localhost/js/main.js";
			document.getElementsByTagName('head')[0].appendChild(script);
		}, 1000);
	}



	
});

document.onmouseup = null;

xx.checkListLi = function() {
	let listLis = $("div.section.sectionMain > form ol > li").map((indx, elem) => {
		let tagAs = $(elem).find("div.listBlock.main > div.titleText > h3.title > a");
		if (tagAs == undefined || tagAs == null || tagAs.length == 0) {
			return {
				url: '',
				li: elem
			};
		}
		let url = '';
		let urls = tagAs.map((indx, tagA) => $(tagA).attr('href'))
			.filter((indx, strUrl) => strUrl != undefined
				&& strUrl != ''
				&& (strUrl.startsWith('posts') || strUrl.startsWith('threads')))
			.toArray();
		if (urls.length > 0) {
			url = urls[0];
		} else {
			console.log(urls);
		}

		if (url == undefined || url == null || url == '' || url.startsWith('forums')) {
			return {
				url: '',
				li: elem
			};
		}
		if (url.startsWith('posts') || url.startsWith('threads')) {
			url = xx.validUrl(url);
		}

		if (url.endsWith('/')) {
			//ok
		} else {
			url = url.substr(0, url.lastIndexOf('/') + 1);
		}

		if (xx.itemExists(url)) {
			$(elem).remove();
			url = '';
		}

		return {
			url: url,
			li: elem
		};
	})
		.filter((idx, obj) => obj.url != '')
		.toArray();
	console.log(`Found ${listLis.length}`);
	console.log(listLis);
}

xx.runDataForTD = function() {
	$("#navigation").append("<div id='infoHere' style='position: absolute;top: 13px;color: black;right: 21%;'></div>");
	$(".xbWelcomeBar").remove();
	$(".my_responsive_ads").remove();
	$("#logoBlock").remove();
	$("aside").remove();
	$("footer").remove();
	$("ul.samTextUnit.samThreadPostMessageInside").remove();
	$(".my_nonresponsive_ads").remove();
	$("#adBottom").remove();
	$(".mainContainer > .mainContent > center").remove();
	$("ul.samBannerUnit").remove();

	$("div.message.likesSummary").css("background-image", "none !important");


	$("img").map((idx, elem) => {
		return {
			xxx: "11xxaayymagento",
			url: $(elem).attr("src"),
			width: $(elem).width(),
			height: $(elem).height(),
			title: document.title,
			source: location.href
		};
	})
		.filter((idx, obj) => TD_REGEX.test(obj.url) && obj.width >= 10 && obj.height >= 10)
		.map((idx, obj) => {
			xx.total++;
			return obj;
		})
		.each((indx, obj) => {
			$.ajax({
				url: 'https://xapi.foo.vn/greenupload/index.php',
				type: 'post',
				data : obj,
				success: function(data) {
					xx.processed++;
					document.title = `${xx.processed}/${xx.total}`;
					$("#infoHere").text(`${xx.processed}/${xx.total}`);
				}
			})
		});
}

xx.postToServer = function(xUrl, callback) {
	setTimeout(() => {
		const req = new XMLHttpRequest();
		const baseUrl = "https://xapi.foo.vn/greenupload/index.php";
		var urlObj = {
			xxx: "11xxaayymagento",
			url: xUrl,
			width: -1,
			height: -1,
			title: 'AUTO FLICKR',
			source: location.href
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
				callback();
			}
		}
	}, 0)
}

if (/(flickr\.com)/.test(location.href)) {
	xx.pid = setInterval(function (){
		if ( document.readyState !== 'complete' ) return;
		clearInterval(xx.pid);
		let FLICKR_REGEX = /live\.staticflickr\.com\\\/([0-9]+)\\\/([0-9]+)_([0-9a-z]+)((_o\.jpg)|(_c\.jpg)|(_l\.jpg)|(_h\.jpg)|(_k\.jpg))/gm
		let scripts = document.getElementsByClassName("modelExport");
		if (scripts.length == 0) {
			return;
		}
		
		let strData = unescape(scripts[0].text);
		let m;

		while ((m = FLICKR_REGEX.exec(strData)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === FLICKR_REGEX.lastIndex) {
				FLICKR_REGEX.lastIndex++;
			}
			
			if (m.length == 0) {
				continue;
			}
			
			if (m[0] == undefined || m[0] === "") {
				continue;
			}
			
			xx.postToServer("https://" + unescape(m[0]), () => {});
		}
	},100);
}