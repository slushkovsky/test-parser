/*  Returns the count of existed pages
 */

function pagesCount() {
    return $('#pages-carousel .item').length;
}
 

/*  Creates new page inside carousel
 */  

function createPage() {
    var page = $('<div></div>').addClass('item');

    if (pagesCount() == 0)
        page.addClass('active');

    addPageToNav(pagesCount())

    $('#pages-carousel .carousel-inner').append(page);
}


/*  Adds page to navigation.  
 *
 *  Parameters
 *  ----------
 *  pageNum  <Int>            Page index number (from 0).
 */

function addPageToNav(pageNum) {
    var lastNav = $('#view-progress nav ul').children().last();
    var navButton = $('<li></li>').append('<a>' + (pageNum + 1) + '</a>');

    navButton.click(function() {
        $('#pages-carousel').carousel(pageNum);
    });

    lastNav.before(navButton);
}

/*  Ruturns widget's page (or create it if nesesary).
 *
 *  Parameters
 *  ----------
 *  widgetNum  <Int>    Widget index number (from 0). 
 *  perPage    <Int|3>  Items per one page.   
 *  
 *  Return: jQueryElement
 */ 

function getPage(widgetNum, perPage) {
    var widgetPageNum;

    if (perPage === undefined)
        perPage = 3;

    widgetPageIdx = parseInt(widgetNum / perPage);

    if (widgetPageIdx >= pagesCount()) 
        createPage();

    return $('#pages-carousel .carousel-inner').children('.item').eq(widgetPageIdx);
}

/*  Creates progress widget (from template). 
 *
 *  Parameters
 *  ----------
 *  url      <String>     Webpage URL
 */

var createdProgresses = 0;

function createProgress(url) {
    var clone;
    var page;
    var tmpl = document.querySelector('#pages-carousel template');
    var urlElem = tmpl.content.querySelector('.url');

    urlElem.setAttribute('data-url', url);
    urlElem.innerHTML = url;

    clone = document.importNode(tmpl.content, true);
    getPage(createdProgresses)[0].appendChild(clone);

    createdProgresses++;
}

/*  Updates progress widget. 
 *
 *  Parameters
 *  ----------
 *  elem    <jQueryElement>  Widget element.
 *  status  <Dictionary>     Progress info with fields: 
 *                                'finished'          - Is parsing finished
 *                                'progress'          - Parsing progress (in percentages)
 *                                'stage'             - Current stage
 *                                'result' (optional) - Parsing results
 */

function updateProgress(elem, status) {
    elem.find('.progress-bar').css('width', status.progress);
    elem.find('.status').html(status.status);
    
    if (status.finished) {
        elem.children('.result').show();

        elem.find('.first-img').attr('src', status.result.img);
        elem.find('.title').html(status.result.title); 
        elem.find('.first-h1').html(status.result.h1);
    }
    else
        elem.children('.result').hide();
}

/*  Foinds progress widget by URL
 *
 *  Parameters
 *  ----------
 *  url  <String>  URL
 *
 *  Return: jQueryElement
 */

function findProgressByUrl(url) {
    var found = $('#pages-carousel .url[data-url="' + url + '"]');

    if (found.length == 0)
        return undefined;

    return found.parent();
}

/*  Initialize parsing progress view. 
 *
 *  Parameters
 *  ----------
 *  options
 *    - sessionKey     <String>       Parsing session key (generated on the 
 *                                    backend).  
 *    - updateTimeout  <Integer|500>  Timeout between progress widgets 
 *                                    updates.
 */


function initProgressView(options) {
    if (options.updateTimeout === undefined)
        options.updateTimeout = 500;

    if (options.sessionKey === undefined) {
        console.error('Session key not specified');
        return;
    }

    $('#pages-carousel').carousel();

    $('nav a[data-page]').click(function() {
        $('#pages-carousel').carousel($(this).data('page'));        
    });

    $('#view-progress #btn-cancel').click(function() {
    	resetSession();
        initApp();
        return;
    });

    function updateStatus() {
        $.ajax({
            url: '/status/' + String(options.sessionKey),
            method: 'GET',
            success: function(response) {
                var session = $.parseJSON(response);
                var widget;

                for (var url in session) {
                    widget = findProgressByUrl(url);

                    if (!widget) {
                        createProgress(url);
                        widget = findProgressByUrl(url);

                        if (!widget)
                            console.error('Couldn\'t create progress widget for ' + url);
                    }

                    updateProgress(widget, session[url]);
                }

                setTimeout(updateStatus, options.updateTimeout);
            },
            error: function() {
                alert('Something went wrong (Server error)');
            }
        });
    }

    updateStatus();
} 