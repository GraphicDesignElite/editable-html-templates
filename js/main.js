// Bootstrap
$(document).ready(function () {
    var TRange = null; // just a check we will use later for the search page functionality compatibiity

    setDate(); // Set all date fields to the current date as a convenience
    const editableClassNameConst = '.editable'; // editable content fields class used in our system
    const revertBtnClassNameConst = '.revert-area-button'; // editable content fields class used in our system
    const original = captureOriginal(editableClassNameConst); // Get the original value of all fields

    createLinks(); // Generate the "Page 1, Page 2" links for the page and add smoothscroll
    initEditable(editableClassNameConst); // Make the content editable
    highlightChangedMergeFields(); // shows when a merge field was changed by highlighting it in red during "show merged" enabled
    watchForEdits(editableClassNameConst, original); // watch each field for changes, mark them accordingly, and create links to undo

    // Dynamically created links need event listeners
    $(".document").on("click", revertBtnClassNameConst, function (event) {
        var item = event.target.id.split('n')[1]; // get the field number of the generated link so we know which content area to revert
        ConfirmDialog('Are you sure you want to revert this area?', original, editableClassNameConst, item)
    });

    // Add Button Event Listeners
    $('#revertAllButton').click(function () { // Revert all changes button
        ConfirmDialog('Are you sure you want to revert? You will loose ALL of your changes.', original, editableClassNameConst);
    });
    $('#displayMerged').click(function (e) { // Highlight mergefields
        e.preventDefault();
        $('body').toggleClass('show-merged');
        $('#displayMerged').toggleClass('show-merged');
    });
});
// Generate the "Page 1, Page 2" links for the page and add smoothscroll
function createLinks() {
    var container = $('.page-links');
    var documents = $('.document');
    for (var x = 1; x <= documents.length; x++) {
        documents[x - 1].id = "document" + x;
        $(container).append('<li><a href="#document' + x + '">Page ' + x + '</a></li>')
    }

}
// Make the content editable
function initEditable(editableClassName) {
    console.log("Init Editable Content Areas");
    var autolist = new AutoList();
    var editor = new MediumEditor(editableClassName, {
        buttonLabels: 'fontawesome',
        extensions: {
            'autolist': autolist
        },
        toolbar: {
            buttons: ['h1', 'h2', 'bold', 'italic', 'underline', 'unorderedlist', 'orderedlist']
        }

    });
}
// Set all date fields to the current date as a convenience
function setDate() {
    var m_names = new Array("January", "February", "March",
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December");
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth();
    var yyyy = today.getFullYear();
    if (dd < 10) { dd = '0' + dd }
    var date = m_names[mm] + ' ' + dd + ', ' + yyyy;

    var dateContainers = $('.document-insert-date');
    for (var x = 0; x < dateContainers.length; x++) {
        dateContainers[x].append(date);
    }
}
// Get the original value of all fields so we can revert to the original without remerging
function captureOriginal(editableClassName) {
    console.log("Capture Original Data");
    var editableFields = $(editableClassName);
    var editarr = [];
    for (i = 0; i < editableFields.length; i++) {
        editarr.push($(editableFields[i]).html());
    }
    return editarr;
}
// End Get the original value of all fields
function setupUndo() {
    var contents = $('.editable').html();
    $('.editable').blur(function () {
        if (contents != $(this).html()) {
            // save our contents
            alert('changed');

            contents = $(this).html();
        }
    });
}
//Show all Mergefields
function highlightChangedMergeFields() {
    $(".merge-field").on('DOMSubtreeModified', function () {
        $(this).addClass('edited');
    });
}
// Create revert button - watch each field to see if it has changed since the original document was loaded
function watchForEdits(editableClassName, original) {
    $(editableClassName).on('DOMSubtreeModified', function () {
        if (!$(this).hasClass('edited')) {
            var position = $(editableClassName).index($(this));
            if ($(this).html() != original[position]) {
                $(this).addClass('edited');
                $(this).after(function () {
                    return '<a id="button' + position + '" class="revert-area-button">Revert</a>';
                });
            }
        }
    });
}
function recallAllAreas(original, editableClassName) {
    var editableFields = $(editableClassName);
    for (i = 0; i < editableFields.length; i++) {
        $(editableFields[i]).html(original[i]);
        $(editableFields[i]).removeClass('edited');
        $('.revert-area-button').remove();
    }
}
function recallSelectedArea(original, editableClassName, index) {
    var editableFields = $(editableClassName);
    $(editableFields[index]).html(original[index]);
    $(editableFields[index]).removeClass('edited');
    $(editableFields[index]).parent().find(".revert-area-button").remove();

}
function ConfirmDialog(message, original, editableClassName, item) { // confirms resets of data
    var editableFields = $(editableClassName);

    $('<div></div>').appendTo('body')
        .html('<div><h6>' + message + '?</h6></div>')
        .dialog({
            modal: true, title: 'Remove Changes', zIndex: 10000, autoOpen: true,
            width: 'auto', resizable: false,
            buttons: {
                OK: function () {
                    if (item == null) { // if we pass no identifier, clear all the data
                        recallAllAreas(original, editableClassName);
                        highlightChangedMergeFields();

                    }
                    else {
                        // clear only the data of the current field
                        recallSelectedArea(original, editableClassName, item);
                    }
                    $(this).dialog("close");
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(this).remove();
            }
        });
};
//SmoothScroll
$(function () {
    $('a[href*="#"]:not([href="#"])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });
});
// Search Document
function findString(str, fromModal = false) {
    $('#t1').val('');
    var TRange = null;
    if (parseInt(navigator.appVersion) < 4) return;
    var strFound;
    if (window.find) {
        strFound = self.find(str);
        if (!strFound) {
            strFound = self.find(str, 0, 1);
            while (self.find(str, 0, 1)) continue;
        }else{
            if(!fromModal){
                searchDialog(str);
            }
        }
    }
    else if (navigator.appName.indexOf("Microsoft") != -1) {
        if (TRange != null) {
            TRange.collapse(false);
            strFound = TRange.findText(str);
            if (strFound){ 
                TRange.select();
                if(!fromModal){
                    searchDialog(str);
                }
            }
        }
        if (TRange == null || strFound == 0) {
            TRange = self.document.body.createTextRange();
            strFound = TRange.findText(str);
            if (strFound){
                TRange.select();
            }else{
                if(!fromModal){
                    searchDialog(str);
                }
            }
        }
    }
    else if (navigator.appName == "Opera") {
        alert("Opera browsers not supported, sorry...")
        return;
    }
    if (!strFound) alert(str + "' not found!")
    return;
}
function searchDialog(str) { // confirms resets of data
    $('#searchDialog').remove();
    $('<div id="searchDialog"></div>').appendTo('body')
        .html('<div></div>')
        .dialog({
            modal: false, title: 'Searching For ' + str, zIndex: 10000, autoOpen: true,
            width: '300', resizable: true,
            buttons: {
                Next: function () {
                    findString(str, true);
                },
                Done: function () {
                    $(this).dialog("close");
                }
            },
            close: function (event, ui) {
                $(this).remove();
            }
        });
};