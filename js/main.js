'use strict';

var openedFileName;
var activeBind;

// Setup Material select
$(document).ready(function() {
	$('select').material_select();
});

$('#button-upload').click(function() {
	var fileSelector = $('<input type="file">');
	fileSelector.change(function() {
		var files = fileSelector[0].files;
		if (files.length) {
			var reader = new FileReader();
			reader.onload = function() {
				try {
					loadJSON(parseSaveData(reader.result));
				} catch (e) {
					alert('不是有效的CM3D2存档');
				}
				openedFileName = files[0].name.replace(/\.[^.]+$/, '');
			}
			reader.readAsArrayBuffer(files[0]);
		}
	});
	fileSelector.click();
});

$('#button-loadjson').click(function() {
	var fileSelector = $('<input type="file">');
	fileSelector.change(function() {
		var files = fileSelector[0].files;
		if (files.length) {
			var reader = new FileReader();
			reader.onload = function() {
				try {
					loadJSON(JSON.parse(reader.result));
				} catch (e) {
					alert('不是有效的JSON');
				}
				openedFileName = files[0].name.replace(/\.[^.]+$/, '');
			}
			reader.readAsText(files[0]);
		}
	});
	fileSelector.click();
});

$('#button-download').click(function() {
	if (!activeModel) {
		alert('你还没有加载任何文件');
		return;
	}
	saveAs(new Blob([new Uint8Array(writeSaveData(activeModel))]), openedFileName + '.save');
});

$('#button-savejson').click(function() {
	if (!activeModel) {
		alert('你还没有加载任何文件');
		return;
	}
	saveTextAs(JSON.stringify(activeModel, null, 2), openedFileName + '.json');
});

var activeXMLDocument;
var activeModel;

function loadJSON(model) {
	activeModel = model;

	if (activeBind)
		activeBind.unbind();
	activeBind = rivets.bind($('#profile'), activeModel);

	$("input").change();
	$('select').material_select('update');
	$("select").closest('.input-field').children('span.caret').remove();
}

rivets.formatters.int32 = {
	read: function(value) {
		return value;
	},
	publish: function(value) {
		return parseInt(value);
	}
};

rivets.formatters.int64 = {
	read: function(value) {
		return new Long(value[0], value[1]).toString();
	},
	publish: function(value) {
		try {
			var long = Long.fromString(value);
		} catch (e) {
			return [0, 0];
		}
		return [long.low_, long.high_];
	}
};