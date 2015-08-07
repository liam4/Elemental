//probably should put this in a local function on prod... fine for now tho

if (!String.prototype.startsWith) {  // sweet polyfill
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

function toArr(nl) {
	return Array.prototype.slice.call(nl);
}

function includesArrItem(str, arr) {
	var includes = false;
	for (var i = 0; i < arr.length; i++) {
		if (str.indexOf(arr[i]) > -1) {
			includes = true;
			break;
		}
	}
	return includes;
}

function getChildElem(parent, cName) {
	var child = null;
	for (var i = 0; i < parent.childNodes.length; i++) {
	    if (parent.childNodes[i].className == cName) {
	        child = parent.childNodes[i];
	        break;
	    }        
	}
	return child;
}

function getElType(node) {
	var classList = node.className.split(' ');
	var type = null;
	for (var i = 0; i < classList.length; i++) {
		if (classList[i].startsWith('e-')) {
			type = classList[i].substr(2, classList[i].length - 1);
			break;
		}
	}
	return type;
}

function traverseTree(parentNode) {
	parentNode = parentNode.children[1];
	var directChildren = toArr(parentNode.children);
	var pushedArr = [];
	for (var i = 0; i < directChildren.length; i++) {
		if (includesArrItem(directChildren[i].className, stackElements)) {
			var elType = getElType(directChildren[i]);
			console.log(elType);
			pushedArr.push({tag: elType});
		} else if (includesArrItem(directChildren[i].className, wrapperElements)) {
			var elType = getElType(directChildren[i]);
			console.log(elType);
			pushedArr.push({tag: elType, child: traverseTree(directChildren[i])});
			console.log('exit tree');
		}
	}
	return pushedArr;
}

var script = document.getElementsByClassName('script')[0].cloneNode(true); //should only be one...

var directChildren = toArr(script.children);
directChildren.shift();

var jsonFormat = {
	tag: 'body',
	attr: {},
	child: [],
};
var blocks = [];

var stackElements = ['e-img', 'e-text', ];
var wrapperElements = ['e-div', 'e-body', ];

for (var i = 0; i < directChildren.length; i++) {
	if (includesArrItem(directChildren[i].className, stackElements)) {
		var elType = getElType(directChildren[i]);
		console.log(elType);
		blocks.push({tag: elType});
	} else if (includesArrItem(directChildren[i].className, wrapperElements)) {
		var elType = getElType(directChildren[i]);
		console.log(elType);
		blocks.push({tag: elType, child: traverseTree(directChildren[i])});
		console.log('exit tree');
	}
}
jsonFormat.child = blocks;
// example:
//
// var json = {
//   tag: 'body',
//   attr: {
//     id: '1',
//     class: ['foo']
//   },
//   child: [{
//     tag: 'h2',
//     text: 'sample text with <code>inline tag</code>'
//   },{
//     tag: 'pre',
//     attr: {
//       id: 'demo',
//       class: ['foo', 'bar']
//     }
//   },{
//     tag: 'pre',
//     attr: {
//       id: 'output',
//       class: ['goo']
//     }
//   },{
//     tag: 'input',
//     attr: {
//       id: 'execute',
//       type: 'button',
//       value: 'execute'
//     }
//   }]
// };