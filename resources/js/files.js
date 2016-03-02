function $(e) {
    // ** We're calling e.split(' ') multiple times here - shouldn't we just
    // make a variable called "words" or something?
    if (e.split(' ')[e.split(' ').length - 1][0] == '#') {
        return document.getElementById(e.substr(1, e.length - 1));
    }

    // ** Assigning to global variable will pollute the window. Shouldn't
    // there be a `var` here?
    arr = Array.prototype.slice.call(document.querySelectorAll(e));

    // ** arr is already an array and as such implements forEach by default,
    // why are we assigning a new method?
    arr.forEach = function(callback) {
        for (var i = 0; i < arr.length; i++) {
            callback(arr[i], i);
        }
    };

    // ** Why is this alias needed?
    arr.each = arr.forEach;

    arr.on = function(event, callback) {
        arr.forEach(function(item) {
            item.addEventListener(event, callback);
        });
        return arr;
    };

    return arr;
}

// really should have a functions.js file for this

function parentHasClass(element, className) {
    var regex = new RegExp('\\b' + className + '\\b');
    do {
        if (element.classList !== undefined) {
            if (element.classList.contains(className)) {
                return true;
            }
        } else {
            if (regex.exec(element.className)) {
                return true;
            }
        }
        element = element.parentNode;
    } while (element);
    return false;
}

function stringToHtml(str) {
    var d = document.createElement('div');
    d.innerHTML = str;
    return d.firstChild;
}

function arrContainsFromArr(arr1, arr2) {
    for (var i = 0; i < arr2.length; i++) {
        if (arr1.indexOf(arr2[i]) > -1) {
            return true;
        }
    }
    return false;
}

var fileData = {};
var currentFile = 'index.html';

var stackElements = ['e-img', 'e-text', 'e-CSS', 'e-style', ];
var attrNames = ['src', 'class', 'id', 'href', 'rel']; //add attrs
var cssAttrNames = [
    'background-color',
    'height',
    'width',
]; //add attrs
var wrapperElements = ['e-div', 'e-body',  'e-a', 'e-h1', 'e-h2', 'e-h3'];
var unnamedWrapperElements = wrapperElements.map(function(item) {
    return item.substr(2, item.length - 1);
});
var textInput = 'text';

function getBlockHtml(el) {
    console.log('el: ', el);
    var name;
    if (el.tag == 'style') {
        el.tag = 'CSS';
    }
    if (el.tag) {
        name = filter.blocks.filter(function(item) {
            return item.name == el.tag;
        })[0].name;
    } else {
        name = '';
    }

    // ** Ew, parsing HTML by concatenation of strings. We really should just
    // be utilizing the DOM.
    var parsedHtml;

    var attrInputs = [];
    for (attr in el.attr) {
        attrInputs.push([
            '<span class="attr-holder">',
                '<span class="attr-dropdown">' + attr + '</span>',
                '=',
                '<span class="attr-input" contenteditable="true">' + el.attr[attr] + '</span>',
            '</span>'
        ].join(''));

        // ** Is this still necessary/used/helpful?
        console.log(attr);
    }
    attrInputs = attrInputs.join('');

    if (el.tag === "") {
        parsedHtml = [
            '<li class="stack e-text">',
                '<span contenteditable="true" class="script-input text">' + el.text + '</span>',
            '</li>'
        ].join('');
    } else {
        parsedHtml = [
            '<li class="stack e-' + name + '">',
                name,
                attrInputs,
                "<span class='attr-controls'><span class='remove-attr'></span><span class='add-attr'></span></span>",
            '</li>'
        ].join('');
    }

    return parsedHtml;
}

function generateWrapperBlocks(jsonData) {
    var attrInputs = [];
    for (attr in jsonData.attr) {
        // ** Again, using templates.
        attrInputs.push([
            '<span class="attr-holder">',
                '<span class="attr-dropdown">' + attr + '</span>',
                '=',
                '<span class="attr-input" contenteditable="true">' + jsonData.attr[attr] + '</span>',
            '</span>'
        ].join(''));
    }
    attrInputs = attrInputs.join('');
    var wrapperHtml = [
        '<ul class="c-wrapper e-' + jsonData.tag + '">',
            '<li class="c-header">' + jsonData.tag + attrInputs + ' <span class="attr-controls"><span class="remove-attr"></span><span class="add-attr"></span></span></li>',
            '<ul class="c-content">',
    ];
    for (var i = 0; i < jsonData.child.length; i++) {
        var curEl = jsonData.child[i];
        if (stackElements.indexOf('e-' + curEl.tag) > -1 || curEl.tag === '') {  // if it's a stack or plain text
            wrapperHtml.push(getBlockHtml(curEl));
        }
        if (unnamedWrapperElements.indexOf(curEl.tag) > -1) {
            // repeat down tree...
            wrapperHtml.push(generateWrapperBlocks(curEl));
        }
    }

    wrapperHtml.push(
        '</ul><li class="c-footer">&nbsp;</li></ul>'
    );

    return wrapperHtml.join('');
}

function getCSSAttributesHTML(attributes) {
    var pushedHtml = [];
    for (attr in attributes) {
        var attrValue = attributes[attr];
        // ** AGAIN, using templates.
        pushedHtml.push('<li class="stack e-rule">rule <span class="script-input css-attr-dropdown" contenteditable="true">' + attr + '</span>: <span class="script-input" contenteditable="true">' + attrValue + '</span></li>');
    }
    return pushedHtml.join('');
}

function generateBlocks(jsonData, ext) {
    if (ext == 'html') {
        jsonData = jsonData.child;
        // ** Yet again, using templates.
        var baseHtml = [
            '<ul class="script">',
                '<li class="hat">&lt;!DOCTYPE html&gt;</li>',
                '<ul class="c-wrapper e-body">',
                    '<li class="c-header">&lt;body&gt;</li>',
                    '<ul class="c-content">',
        ];

        console.log(jsonData);
        for (var i = 0; i < jsonData.length; i++) {
            var curEl = jsonData[i];
            console.log(curEl.tag);
            if (stackElements.indexOf('e-' + curEl.tag) > -1 || curEl.tag === '') {  // if it's a stack or plain text
                baseHtml.push(getBlockHtml(curEl));
            }
            if (unnamedWrapperElements.indexOf(curEl.tag) > -1) {
                // repeat down tree...
                baseHtml.push(generateWrapperBlocks(curEl));
            }
        }


        baseHtml.push('</ul><li class="c-footer">&lt;/body&gt;</li></ul></ul>');
        return baseHtml.join('');
    } else if (ext == 'css') {
        var baseHtml = [
            '<ul class="script">',
                '<li class="hat">' + currentFile + '</li>',
        ];
        for (curSelector in jsonData) {
            var selectorHtml = [
                '<ul class="c-wrapper e-selector">',
                    '<li class="c-header">selector <span class="script-input" contenteditable="true">' + curSelector + '</span></li>',
                    '<ul class="c-content">'
            ];
            selectorHtml.push(getCSSAttributesHTML(jsonData[curSelector].attributes));
            selectorHtml.push('</ul><li class="c-footer">&nbsp;</li></ul>');
            baseHtml.push(selectorHtml.join(''));
        }
        baseHtml.push('</ul>');
        return baseHtml.join('');
    } else {
        throw 'the world is going to be destroyed due to your foolishness, mortal!1111!  ' + ext + '';
    }
}

function loadFile(filename, el) {
    if (el) {
        setFrameContent(); // save json
    }

    currentFile = filename;

    var fileJson = fileData[filename];

    if (el) {
        // first deselect other files...
        $('.filePane .file.selected').each(function(elem) {
            elem.classList.remove('selected');
        });
        // select this one...
        el.parentNode.classList.add('selected');
    }

    // render the HTML somehow from the blocks
    blockArea = $('.scriptingArea')[0];
    console.log(fileData);
    blockArea.innerHTML = generateBlocks(fileJson, filename.split('.').pop());
    setFrameContent();
    setZebra();
}

function manuallyCreateFile() {
    //we need something better than this
    var fileName = prompt('Enter a file name', '.html');
    var ext = fileName.split('.');
    ext = ext[ext.length - 1];
    var allowedExts = ['html', 'css'];
    if (allowedExts.indexOf(ext) > -1) {
        if (fileName && !fileData.hasOwnProperty(fileName)) {
            generateFile(fileName, ext);
        }
    } else {
        throw 'File type "' + ext + '" not supported.';
    }
}

function generateFile(fileName, ext, initial) {
    currentFile = fileName;

    var finalFile = $('.add-file')[0];

    // first deselect the other files...
    $('.filePane .file.selected').each(function(el) {
        el.classList.remove('selected');
    });

    // then insert the new file selector...
    var fileSelector = document.createElement('div');
    fileSelector.className = 'file selected';
    fileSelector.innerHTML = [
        '<div class="file-name" data-file="' + fileName + '">',
            fileName,
        '</div>'].join('');
    finalFile.parentNode.insertBefore(fileSelector, finalFile);

    // set the fileData for it to be basic...
    if (initial) {
        fileData[fileName] = initial;
    } else {
        if (ext == 'html') {
            fileData[fileName] = {
                "tag": "body",
                "attr": {},
                "child": []
            };
        } else if (ext == 'css') {
            fileData[fileName] = {
                'children': {
                    '.selector': { // should I initialize this?  probably not, maybe?  idk post comments on it
                        'children': {},
                        'attributes': {
                            'background-color': 'red',
                        }
                    }
                },
                'attributes': {}
            };
        } else {
            throw 'File type "' + ext + '" not supported.';
        }
    }
    blockArea = $('.scriptingArea')[0];

    if (initial) {
        blockArea.innerHtml = generateBlocks(initial);  // add shim later?
    } else {
        if (ext == 'css') {
            blockArea.innerHTML = generateBlocks(fileData[fileName].children, ext);
        } else {
            blockArea.innerHTML = generateBlocks([], ext);
        }
    }

    //clear preview window
    var previewWindow = document.getElementsByClassName('previewBody')[0];
    previewWindow = (previewWindow.contentWindow) ? previewWindow.contentWindow : (previewWindow.contentDocument.document) ? previewWindow.contentDocument.document : previewWindow.contentDocument;

    previewWindow.document.open();
    previewWindow.document.write('');
    previewWindow.document.close();
}

var FILE_MENU = document.querySelector('.context-menu.files');
var RIGHT_CLICKED;

$('.filePane').on('click', function(ev) {
    var el = ev.target;
    if (el.classList.contains('file') || parentHasClass(el, 'file')) {
        if (el.classList && el.classList.contains('file')) {
            loadFile(el.children[0].dataset.file, el.children[0]);
        } else if (parentHasClass(el, 'file')) {
            loadFile(el.dataset.file, el);
        }
        ev.stopPropagation();
    } else if (el.classList.contains('add-file') || parentHasClass(el, 'add-file')) {
        manuallyCreateFile();
        ev.stopPropagation();
    }
    FILE_MENU.style.display = 'none';
    RIGHT_CLICKED = undefined;
}).on('contextmenu', function(ev) {
    var el = ev.target;
    if (el.classList.contains('file') || parentHasClass(el, 'file')) {
        var fileName;
        var clickedEl;
        if (el.classList && el.classList.contains('file')) {
            fileName = el.children[0].dataset.file;
            clickedEl = el;
        } else if (parentHasClass(el, 'file')) {
            fileName = el.dataset.file;
            clickedEl = el.parentNode;
        }

        RIGHT_CLICKED = {file: fileName, el: clickedEl};

        FILE_MENU.style.display = 'block';
        FILE_MENU.style.top = ev.pageY + 'px';
        FILE_MENU.style.left = ev.pageX + 'px';

        ev.preventDefault();
    } else if (el.classList.contains('add-file') || parentHasClass(el, 'add-file')) {
        ev.preventDefault();
    }
});

$('.context-menu.files .menu-item').on('click', function(ev) {
    if (RIGHT_CLICKED) {
        switch (this.dataset.action) {
            case 'delete-file':
                if (Object.keys(fileData).length > 1) {
                    if (RIGHT_CLICKED.file == currentFile) {
                        loadFile(Object.keys(fileData)[0], document.querySelector('.filePane .file').children[0]);
                    }
                    RIGHT_CLICKED.el.parentNode.removeChild(RIGHT_CLICKED.el);
                    delete fileData[RIGHT_CLICKED.file];
                }
                break;

            case 'rename-file':
                var newName = prompt('Enter the new file name:', RIGHT_CLICKED.file);
                if (newName && !fileData.hasOwnProperty(newName)) {
                    RIGHT_CLICKED.el.children[0].textContent = newName;
                    RIGHT_CLICKED.el.children[0].dataset.file = newName;
                    fileData[newName] = fileData[RIGHT_CLICKED.file];
                    delete fileData[RIGHT_CLICKED.file];
                    currentFile = newName;
                }
                break;

            case 'duplicate-file':
                var oldName = RIGHT_CLICKED.file.split('.');
                var newName = oldName[oldName.length - 2] + '-copy.' + oldName[oldName.length - 1];  //there should be a better way...
                if (!fileData.hasOwnProperty(newName)) {
                    generateFile(newName, oldName[oldName.length - 1], fileData[RIGHT_CLICKED.file]);
                }
                break;

            default:
                //nothing
        }
    }
    RIGHT_CLICKED = undefined;
    FILE_MENU.style.display = 'none';
});
