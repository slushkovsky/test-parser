function initApp() {
    var session = getSession(); 

    if (session)
        selectView('progress', {sessionKey: session});
    else 
        selectView('inputs', {
            onSuccessSent: function(resp) {
                var session = resp['session'];

                setSession(session);
                selectView('progress', {sessionKey: session});
            }
        });
}

$(function() {
    initApp();
});
