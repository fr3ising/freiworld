$("#submitmsg").click(
    function(){  
	var message = $("#message").val();
	var nick = $("#nick").val();
	$.post("/postChat",{message:message,nick:nick});
	$("#message").attr("value", "");  
	return false;  
    });  

function loadLog(){  
    var oldscrollHeight = $("#chatbox").attr("scrollHeight") - 20; //Scroll height before the request  
    $.ajax({  
        url: "/chatDisplay",
        cache: true,
        ifModified: true,
        success: function(html){
            $("#chatbox").html(html);
        },  
    });  
}  

// window.onblur=lostfocus;

// function lostfocus(e) {
//     setInterval (loadLog, 100000*10);
// }

setInterval (loadLog, 5000*1);
loadLog();

