/*
 *  Copyright (c) Codiad & Kent Safranski (codiad.com), distributed
 *  as-is and without warranty under the MIT License. See
 *  [root]/license.txt for more. This information must remain intact.
 */

function addClickListener() {
	//console.log("addClickListener() called");
	window.setTimeout(clickListener,200);
}

function clickListener() {
	$('.directory').unbind('click');
	$(".directory").click(function() {
		//console.log( "Change directory." );
		var this_name = $(this).attr('data-path');
        $.post(terminal.controller,{command:'change_directory_to:'+this_name, target_name: this_name},function(data) {
        	data = data.split("/");
        	var directory =  data[data.length -1];
       		$("#prompt").text("" + directory + "/ >");
       		$("#prompt_text").css("padding-left" , ($("#prompt").width() + 10));	
       	});
	});
}

(function(global, $){

    var codiad = global.codiad;

    $(window)
        .load(function() {
            codiad.filemanager.init();
        });

    codiad.filemanager = {

        clipboard: '',

        noOpen: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'exe', 'zip', 'tar', 'tar.gz'],
        noBrowser: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],

        controller: 'components/filemanager/controller.php',
        dialog: 'components/filemanager/dialog.php',
        dialogUpload: 'components/filemanager/dialog_upload.php',
        contextMenuBlocked: 'false', // used for readonl project

        init: function() {
            // Initialize node listener
            this.nodeListener();
            // Load uploader
            $.loadScript("components/filemanager/upload_scripts/jquery.ui.widget.js", true);
            $.loadScript("components/filemanager/upload_scripts/jquery.iframe-transport.js", true);
            $.loadScript("components/filemanager/upload_scripts/jquery.fileupload.js", true);
        },

        //////////////////////////////////////////////////////////////////
        // Listen for dbclick events on nodes
        //////////////////////////////////////////////////////////////////

        nodeListener: function() {
            var _this = this;
			            
            $('#file-manager').on('selectstart', false);

            $('#file-manager span')
                .live('click', function() { // Open or Expand
                    if ($(this).parent().children("a").attr('data-type') == 'directory') {
                        _this.index($(this).parent().children("a")
                            .attr('data-path'));
                        
                    } else {
                        _this.openFile($(this).parent().children("a")
                            .attr('data-path'));
                    }
                    if (!$(this).hasClass('none')) {
                        if ($(this).hasClass('plus')) {
                            $(this).removeClass('plus')
                            $(this).addClass('minus');
                            addClickListener();
                        } else {
                            $(this).removeClass('minus')
                            $(this).addClass('plus');
                        }
                    }
                    addClickListener();
                });
            $('#file-manager a')
                .live('dblclick', function() { // Open or Expand
                    if ($(this)
                        .hasClass('directory')) {
                        _this.index($(this)
                            .attr('data-path'));
                    } else {
                        _this.openFile($(this)
                            .attr('data-path'));


						/*
						 *  LF : Set the readonly property
						 */
						
						//codiad.filemanager.setReadOnly($(this).attr('data-path'));
						
                        /*
                         * LF : Changing the mode of the editor for this file extension {
                         */
                        
                        
                        var extension = $(this).attr('data-path').split(".").pop();
		                var newMode = "ace/mode/" + extension;
		                var actSession = codiad.editor.activeInstance.getSession();
		
		                // handle async mode change
		                var fn = function(){
		                   codiad.editor.setModeDisplay(actSession);
		                   actSession.removeListener('changeMode', fn);
		                }
		                actSession.on("changeMode", fn);
		
		                actSession.setMode(newMode);
                        /*
                         * }
                         */
                    }
                    if (!$(this).parent().children("span").hasClass('none')) {
                        if ($(this).parent().children("span").hasClass('plus')) {
                            $(this).parent().children("span").removeClass('plus')
                            $(this).parent().children("span").addClass('minus');
                            addClickListener();
                        } else {
                            $(this).parent().children("span").removeClass('minus')
                            $(this).parent().children("span").addClass('plus');
                        }
                    }
                })
                .live("contextmenu", function(e) { // Context Menu
                    e.preventDefault();
                    _this.contextMenuShow(e, $(this)
                        .attr('data-path'), $(this)
                        .attr('data-type'));
                    $(this)
                        .addClass('context-menu-active');
                });
        },

        //////////////////////////////////////////////////////////////////
        // Context Menu
        //////////////////////////////////////////////////////////////////

        contextMenuShow: function(e, path, type) {
			console.log("showing context menu");
            var _this = this;
			_this.setContextMenuBlocked(path);
			if (_this.contextMenuBlocked == 'false') {
	            // Selective options
	            switch (type) {
	            case 'directory':
	                $('#context-menu .directory-only, #context-menu .non-root')
	                    .show();
	                $('#context-menu .file-only, #context-menu .root-only')
	                    .hide();
	                break;
	            case 'file':
	                $('#context-menu .directory-only, #context-menu .root-only')
	                    .hide();
	                $('#context-menu .file-only,#context-menu .non-root')
	                    .show();
	                break;
	            case 'root':
	                $('#context-menu .directory-only, #context-menu .root-only')
	                    .show();
	                $('#context-menu .non-root, #context-menu .file-only')
	                    .hide();
	                break;
	            }
	            if(codiad.project.isAbsPath($('#file-manager a[data-type="root"]').attr('data-path'))) {
	                $('#context-menu .no-external').hide();
	            } else {
	                $('#context-menu .no-external').show();
	            }
	            // Show menu
	            $('#context-menu')
	                .css({
	                'top': (e.pageY - 40) + 'px',
	                'left': (e.pageX - 30) + 'px'
	            })
	                .fadeIn(200)
	                .attr('data-path', path)
	                .attr('data-type', type);
	            // Show faded 'paste' if nothing in clipboard
	            if (this.clipboard === '') {
	                $('#context-menu a[content="Paste"]')
	                    .addClass('disabled');
	            } else {
	                $('#context-menu a[data-action="paste"]')
	                    .removeClass('disabled');
	            }
	            // Hide menu
	            $('#file-manager, #editor-region')
	                .on('mouseover', function() {
	                    _this.contextMenuHide();
	                });
	            // Hide on click
	            $('#context-menu a')
	                .click(function() {
	                    _this.contextMenuHide();
	                });
	                
				addClickListener();
			}            
        },

        contextMenuHide: function() {
            $('#context-menu')
                .fadeOut(200);
            $('#file-manager a')
                .removeClass('context-menu-active');
        },

        //////////////////////////////////////////////////////////////////
        // Return the node name (sans path)
        //////////////////////////////////////////////////////////////////

        getShortName: function(path) {
            return path.split('/')
                .pop();
        },

        //////////////////////////////////////////////////////////////////
        // Return extension
        //////////////////////////////////////////////////////////////////

        getExtension: function(path) {
            return path.split('.')
                .pop();
        },
        
        //////////////////////////////////////////////////////////////////
        // Get Readonly
        //////////////////////////////////////////////////////////////////

        setReadOnly: function(path) {
        	$.get(this.controller + '?action=get_readonly&path=' + path, function(data) {
        		//console.log("data = "+ data);
        		 if (data == "TRUE") {
        		 	codiad.editor.getActive().setReadOnly(true);
        		 	//console.log("readonly true");
        		 } else {
        		 	codiad.editor.getActive().setReadOnly(false);
        		 	//console.log("readonly false");
        		 }
        	});
        },
        
        //////////////////////////////////////////////////////////////////
        // Set contextMenuBlocked
        //////////////////////////////////////////////////////////////////

        setContextMenuBlocked: function(path) {
        	var _this = this;
        	$.get(this.controller + '?action=get_readonly&path=' + path, function(data) {
        		
        		 if (data == "TRUE") {
        		 	_this.contextMenuBlocked = 'true';
        		 	//codiad.editor.getActive().setReadOnly(true);
        		 	console.log("readonly true");
        		 } else {
        		 	_this.contextMenuBlocked = 'false';
        		 	//codiad.editor.getActive().setReadOnly(false);
        		 	console.log("readonly false");
        		 }
        	});
        },
		
        //////////////////////////////////////////////////////////////////
        // Return type
        //////////////////////////////////////////////////////////////////

        getType: function(path) {
            return $('#file-manager a[data-path="' + path + '"]')
                .attr('data-type');
        },

        //////////////////////////////////////////////////////////////////
        // Create node in file tree
        //////////////////////////////////////////////////////////////////

        createObject: function(parent, path, type) {
            // NODE FORMAT: <li><a class="{type} {ext-file_extension}" data-type="{type}" data-path="{path}">{short_name}</a></li>
            var parentNode = $('#file-manager a[data-path="' + parent + '"]');
            if (!$('#file-manager a[data-path="' + path + '"]')
                .length) { // Doesn't already exist
                if (parentNode.hasClass('open') && parentNode.hasClass('directory')) { // Only append node if parent is open (and a directory)
                    var shortName = this.getShortName(path);
                    if (type == 'directory') {
                        var appendage = '<li><span class="none"></span><a class="directory" data-type="directory" data-path="' + path + '">' + shortName + '</a></li>';
                    } else {
                        var appendage = '<li><span class="none"></span><a class="file ext-' +
                            this.getExtension(shortName) +
                            '" data-type="file" data-path="' +
                            path + '">' + shortName + '</a></li>';
                    }
                    if (parentNode.siblings('ul')
                        .length) { // UL exists, other children to play with
                        parentNode.siblings('ul')
                            .append(appendage);
                    } else {
                        $('<ul>' + appendage + '</ul>')
                            .insertAfter(parentNode);
                    }
                    addClickListener();
                } else {
                    parentNode.parent().children('span').removeClass('none');  
                    parentNode.parent().children('span').addClass('plus');  
                }
            }
            addClickListener();
        },

        //////////////////////////////////////////////////////////////////
        // Loop out all files and folders in directory path
        //////////////////////////////////////////////////////////////////

        index: function(path, rescan) {
            if (rescan === undefined) {
                rescan = false;
            }
            
            
            node = $('#file-manager a[data-path="' + path + '"]');
            if (node.hasClass('open') && !rescan) {
                node.parent('li')
                    .children('ul')
                    .slideUp(300, function() {
                    $(this)
                        .remove();
                    node.removeClass('open');
                });
            } else {
                node.addClass('loading');
                $.get(this.controller + '?action=index&path=' + path, function(data) {
                    node.addClass('open');
                    var objectsResponse = codiad.jsend.parse(data);
                    if (objectsResponse != 'error') {
                        files = objectsResponse.index;
                        if (files.length > 0) {
                            var display = 'display:none;';
                            if (rescan) {
                                display = '';
                            }
                            var appendage = '<ul style="' + display + '">';
                            $.each(files, function(index) {
                                var ext = '';
                                var name = files[index].name.replace(path, '');
                                var nodeClass = 'none';
                                name = name.split('/')
                                    .join(' ');
                                if (files[index].type == 'file') {
                                    var ext = ' ext-' + name.split('.')
                                        .pop();
                                }
                                if(files[index].type == 'directory' && files[index].size > 0) {
                                    nodeClass = 'plus';
                                } 
                                appendage += '<li><span class="' + nodeClass + '"></span><a class="' + files[index].type + ext + '" data-type="' + files[index].type + '" data-path="' + files[index].name + '">' + name + '</a></li>';
                            });
                            appendage += '</ul>';
                            if (rescan) {
                                node.parent('li')
                                    .children('ul')
                                    .remove();
                            }
                            $(appendage)
                                .insertAfter(node);
                            if (!rescan) {
                                node.siblings('ul')
                                    .slideDown(300);
                            }
                        }
                    }
                    node.removeClass('loading');
                    if (rescan && this.rescanChildren.length > this.rescanCounter) {
                        this.rescan(this.rescanChildren[this.rescanCounter++]);
                    } else {
                        this.rescanChildren = [];
                        this.rescanCounter = 0;
                    }
                });
            }
            addClickListener();
            codiad.filemanager.setContextMenuBlocked(path);
        },

        rescanChildren: [],

        rescanCounter: 0,

        rescan: function(path) {
            var _this = this;
            if (this.rescanCounter === 0) {
                // Create array of open directories
                node = $('#file-manager a[data-path="' + path + '"]');
                node.parent()
                    .find('a.open')
                    .each(function() {
                        _this.rescanChildren.push($(this)
                            .attr('data-path'));
                    });
            }

            this.index(path, true);
            
        },

        //////////////////////////////////////////////////////////////////
        // Open File
        //////////////////////////////////////////////////////////////////

        openFile: function(path, focus) {
        	
        	console.log("open file called");
        	/*
			 *  LF : Set the readonly property
			 */
			
			
            if (focus === undefined) {
                focus = true;
            }
            var node = $('#file-manager a[data-path="' + path + '"]');
            var ext = this.getExtension(path);
            if ($.inArray(ext.toLowerCase(), this.noOpen) < 0) {
                node.addClass('loading');
                $.get(this.controller + '?action=open&path=' + path, function(data) {
                    var openResponse = codiad.jsend.parse(data);
                    if (openResponse != 'error') {
                        node.removeClass('loading');
                        codiad.active.open(path, openResponse.content, openResponse.mtime, false, focus);
                        
                    }
                });
            } else {
                if(!codiad.project.isAbsPath(path)) {
                    if ($.inArray(ext.toLowerCase(), this.noBrowser) < 0) {
                        this.download(path);
                    } else {
                        this.openInModal(path);
                    }
                 } else {
                    codiad.message.error('Unable to open file in Browser');
                 }
            }
			
        },

        //////////////////////////////////////////////////////////////////
        // Open in browser
        //////////////////////////////////////////////////////////////////

        openInBrowser: function(path) {
            $.get(this.controller + '?action=open_in_browser&path=' + path, function(data) {
                var openIBResponse = codiad.jsend.parse(data);
                if (openIBResponse != 'error') {
                    window.open(openIBResponse.url, '_newtab');
                }
            });
        },
        openInModal: function(path) {
            codiad.modal.load(250, this.dialog, {
                        action: 'preview',
                        path: 'workspace/' + path
                    });
        },
        saveModifications: function(path, data, callbacks){
            callbacks = callbacks || {};
            var _this = this, action, data;
            var notifySaveErr = function() {
                codiad.message.error(i18n('File could not be saved'));
                if (typeof callbacks.error === 'function') {
                    var context = callbacks.context || _this;
                    callbacks.error.apply(context, [data]);
                }
            }
            $.post(this.controller + '?action=modify&path='+path, data, function(resp){
                resp = $.parseJSON(resp);
                if (resp.status == 'success') {
                    codiad.message.success(i18n('File saved'));
                    if (typeof callbacks.success === 'function'){
                        var context = callbacks.context || _this;
                        callbacks.success.call(context, resp.data.mtime);
                    }
                } else {
                    if (resp.message == 'Client is out of sync'){
                        var reload = confirm(
                            "Server has a more updated copy of the file. Would "+
                            "you like to refresh the contents ? Pressing no will "+
                            "cause your changes to override the server's copy upon "+
                            "next save."
                        );
                        if (reload) {
                            codiad.active.close(path);
                            codiad.active.removeDraft(path);
                            _this.openFile(path);
                        } else {
                            var session = codiad.editor.getActive().getSession();
                            session.serverMTime = null;
                            session.untainted = null;
                        }
                    } else codiad.message.error('File could not be saved');
                    if (typeof callbacks.error === 'function') {
                        var context = callbacks.context || _this;
                        callbacks.error.apply(context, [resp.data]);
                    }
                }
            }).error(notifySaveErr);
        },
        //////////////////////////////////////////////////////////////////
        // Save file
        //////////////////////////////////////////////////////////////////

        saveFile: function(path, content, callbacks) {
            this.saveModifications(path, {content: content}, callbacks);
        },

        savePatch: function(path, patch, mtime, callbacks) {
            if (patch.length > 0)
                this.saveModifications(path, {patch: patch, mtime: mtime}, callbacks);
            else if (typeof callbacks.success === 'function'){
                var context = callbacks.context || this;
                callbacks.success.call(context, mtime);
            }
        },

        //////////////////////////////////////////////////////////////////
        // Create Object
        //////////////////////////////////////////////////////////////////

        createNode: function(path, type) {
        	var _this = this;
        	_this.setContextMenuBlocked(path);
            codiad.modal.load(250, this.dialog, {
                action: 'create',
                type: type,
                path: path
            });
            $('#modal-content form')
                .live('submit', function(e) {
                    e.preventDefault();
                    var shortName = $('#modal-content form input[name="object_name"]')
                        .val();
                    var path = $('#modal-content form input[name="path"]')
                        .val();
                    var type = $('#modal-content form input[name="type"]')
                        .val();
                    var createPath = path + '/' + shortName;
                    $.get(codiad.filemanager.controller + '?action=create&path=' + createPath + '&type=' + type, function(data) {
                        var createResponse = codiad.jsend.parse(data);
                        if (createResponse != 'error') {
                            codiad.message.success(type.charAt(0)
                                .toUpperCase() + type.slice(1) + ' Created');
                            codiad.modal.unload();
                            // Add new element to filemanager screen
                            codiad.filemanager.createObject(path, createPath, type);
                        }
                    });
                });
        },

        //////////////////////////////////////////////////////////////////
        // Copy to Clipboard
        //////////////////////////////////////////////////////////////////

        copyNode: function(path) {
            this.clipboard = path;
            codiad.message.success(i18n('Copied to Clipboard'));
        },

        //////////////////////////////////////////////////////////////////
        // Paste
        //////////////////////////////////////////////////////////////////

        pasteNode: function(path) {
            var _this = this;
            if (this.clipboard == '') {
                codiad.message.error(i18n('Nothing in Your Clipboard'));
            } else if (path == this.clipboard) {
                codiad.message.error(i18n('Cannot Paste Directory Into Itself'));
            } else {
                var shortName = _this.getShortName(_this.clipboard);
                if ($('#file-manager a[data-path="' + path + '/' + shortName + '"]')
                    .length) { // Confirm overwrite?
                    codiad.modal.load(400, this.dialog, {
                        action: 'overwrite',
                        path: path + '/' + shortName
                    });
                    $('#modal-content form')
                        .live('submit', function(e) {
                        e.preventDefault();
                        var duplicate = false;
                        if($('#modal-content form select[name="or_action"]').val()==1){
                            duplicate=true; console.log('Dup!');
                        }
                        _this.processPasteNode(path,duplicate);
                    });
                } else { // No conflicts; proceed...
                    _this.processPasteNode(path,false);
                }
            }
        },

        processPasteNode: function(path,duplicate) {
            var _this = this;
            var shortName = this.getShortName(this.clipboard);
            var type = this.getType(this.clipboard);
            if(duplicate){
                shortName = "copy_of_"+shortName;
            }
            $.get(this.controller + '?action=duplicate&path=' +
                this.clipboard + '&destination=' +
                path + '/' + shortName, function(data) {
                    var pasteResponse = codiad.jsend.parse(data);
                    if (pasteResponse != 'error') {
                        _this.createObject(path, path + '/' + shortName, type);
                        codiad.modal.unload();
                    }
                });
        },

        //////////////////////////////////////////////////////////////////
        // Rename
        //////////////////////////////////////////////////////////////////

        renameNode: function(path) {
            var shortName = this.getShortName(path);
            var type = this.getType(path);
            var _this = this;
            codiad.modal.load(250, this.dialog, { action: 'rename', path: path, short_name: shortName, type: type});
            $('#modal-content form')
                .live('submit', function(e) {
                    e.preventDefault();
                    var newName = $('#modal-content form input[name="object_name"]')
                        .val();
                    // Build new path
                    var arr = path.split('/');
                    var temp = new Array();
                    for (i = 0; i < arr.length - 1; i++) {
                        temp.push(arr[i])
                    }
                    var newPath = temp.join('/') + '/' + newName;
                    $.get(_this.controller, { action: 'modify', path: path, new_name: newName} , function(data) {
                        var renameResponse = codiad.jsend.parse(data);
                        if (renameResponse != 'error') {
                            codiad.message.success(type.charAt(0)
                                .toUpperCase() + type.slice(1) + ' Renamed');
                            var node = $('#file-manager a[data-path="' + path + '"]');
                            // Change pathing and name for node
                            node.attr('data-path', newPath)
                                .html(newName);
                            if (type == 'file') { // Change icons for file
                                curExtClass = 'ext-' + _this.getExtension(path);
                                newExtClass = 'ext-' + _this.getExtension(newPath);
                                $('#file-manager a[data-path="' + newPath + '"]')
                                    .removeClass(curExtClass)
                                    .addClass(newExtClass);
                            } else { // Change pathing on any sub-files/directories
                                _this.repathSubs(path, newPath);
                            }
                            // Change any active files
                            codiad.active.rename(path, newPath);
                            codiad.modal.unload();
                        }
                    });
                });
        },

        repathSubs: function(oldPath, newPath) {
            $('#file-manager a[data-path="' + newPath + '"]')
                .siblings('ul')
                .find('a')
                .each(function() {
                // Hit the children, hit 'em hard
                var curPath = $(this)
                    .attr('data-path');
                var revisedPath = curPath.replace(oldPath, newPath);
                $(this)
                    .attr('data-path', revisedPath);
            });
        },

        //////////////////////////////////////////////////////////////////
        // Delete
        //////////////////////////////////////////////////////////////////

        deleteNode: function(path) {
            var _this = this;
            codiad.modal.load(400, this.dialog, {
                action: 'delete',
                path: path
            });
            $('#modal-content form')
                .live('submit', function(e) {
                e.preventDefault();
                $.get(_this.controller + '?action=delete&path=' + path, function(data) {
                    var deleteResponse = codiad.jsend.parse(data);
                    if (deleteResponse != 'error') {
                        var node = $('#file-manager a[data-path="' + path + '"]');
                        node.parent('li')
                            .remove();
                        // Close any active files
                        $('#active-files a')
                            .each(function() {
                                var curPath = $(this)
                                    .attr('data-path');
                                if (curPath.indexOf(path) == 0) {
                                    codiad.active.remove(curPath);
                                }
                            });
                    }
                    codiad.modal.unload();
                });
            });
        },

        //////////////////////////////////////////////////////////////////
        // Search
        //////////////////////////////////////////////////////////////////

        search: function(path) {
            codiad.modal.load(500, this.dialog,{
                action: 'search',
                path: path
            });
            codiad.modal.hideOverlay();
            var _this = this;
            $('#modal-content form')
                .live('submit', function(e) {
                $('#filemanager-search-processing')
                    .show();
                e.preventDefault();
                searchString = $('#modal-content form input[name="search_string"]')
                    .val();
                searchType = $('#modal-content form select[name="search_type"]')
                    .val();
                $.post(_this.controller + '?action=search&path=' + path + '&type=' + searchType, {
                    search_string: searchString
                }, function(data) {
                    searchResponse = codiad.jsend.parse(data);
                    if (searchResponse != 'error') {
                        var results = '';
                        $.each(searchResponse.index, function(key, val) {
                            // Cleanup file format
                            if(val['file'].substr(-1) == '/') {
                                val['file'] = val['file'].substr(0, str.length - 1);
                            }
                            val['file'] = val['file'].replace('//','/');
                            // Add result
                            results += '<div><a onclick="codiad.filemanager.openFile(\'' + val['result'] + '\');setTimeout( function() { codiad.active.gotoLine(' + val['line'] + '); }, 500);codiad.modal.unload();">Line ' + val['line'] + ': ' + val['file'] + '</a></div>';
                        });
                        $('#filemanager-search-results')
                            .slideDown()
                            .html(results);
                    } else {
                        $('#filemanager-search-results')
                            .slideUp();
                    }
                    $('#filemanager-search-processing')
                        .hide();
                });
            });
        },

        //////////////////////////////////////////////////////////////////
        // Upload
        //////////////////////////////////////////////////////////////////

        uploadToNode: function(path) {
            codiad.modal.load(500, this.dialogUpload, {path: path});
        },

        //////////////////////////////////////////////////////////////////
        // Download
        //////////////////////////////////////////////////////////////////

        download: function(path) {
            var type = this.getType(path);
            $('#download')
                .attr('src', 'components/filemanager/download.php?path=' + path + '&type=' + type);
        }
    };

})(this, jQuery);
