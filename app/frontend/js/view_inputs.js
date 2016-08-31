var ENTER_CODE = 13;

/*  Adds URL row template to the widget #urls-table
 *
 *  Parameters
 *  ----------
 *  url  <String>  URL
 */

function addURL(url) {
    var tmpl; 
    var clone;

    if (url.length == 0)
        return;

    tmpl = document.querySelector('#urls-table template');
    tmpl.content.querySelector('.url').innerHTML = url; 

    clone = document.importNode(tmpl.content, true);
    document.querySelector('#urls-table').appendChild(clone);

    $('.btn-del-site').click(function() {
        $(this).parent().parent().remove();
    });

    $('input[name="url"]').val('');
}


/*  Collects all URL from widget #urls-table
 *
 *  Return: Array<String> 
 */

function collectUrls() {
    var urls = [];

    $('.url-row .url').each(function() {
        urls.push($(this).html().trim());
    });

    return urls;
}


/*  Initializes URLs input view (urls widget, date&time picker). 
 *
 *  Parameters
 *  ----------
 *  options 
 *    - onSuccessSent  <function>  Callback that calls on successful sending 
 *                                 on the server. Requires only one parameter 
 *                                 - parsed JSON reponse. 
 */

function initInputsView(options) {
    $('#datetimepicker').datetimepicker({
        inline: true,
        sideBySide: true
    });

    $('.url-row .url').remove();
    
    $('#btn-add').click(function() {
        addURL($(this).parent().prev().val());
    });

    $('input[name="url"]').keyup(function(e) {
        if (e.keyCode == ENTER_CODE)
            addURL($(this).val());
    });

    $('[id|="btn-process"]').click(function() {
        var data = {
            'url[]': collectUrls(), 
            'begin_at': $(this).attr('id') == 'btn-process-async' ? $('#datetimepicker').data('date') : 'None'
        };

        $.ajax({
            url: '/parse',
            method: 'POST',
            data: JSON.stringify(data),  
            success: function(resp) {
                if (options.onSuccessSent)
                    options.onSuccessSent($.parseJSON(resp));
            },
            error: function() {
                alert('Something went wrong (Sever error)');
            }
        }); 
    });
}