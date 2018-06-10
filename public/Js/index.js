const socket=io();

$(document).ready(function () {

    let currentSocket={
        emitTo:'draw'
    };

    const canvas=document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const createSession=$('#createSession');

    createSession.click(function () {

        socket.emit('createSession');

    });

    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;

    // 1. Drawing without session
    socket.on('draw',drawFromServer);
    // 2. Drawing with session
    socket.on('sessionCreated',sessionCreated);

    let current={};
    let drawing=false;
    
    
    function drawLine(x1,y1,x2,y2,emit=true){

        if(!drawing){
            return;
        }

        // Canvas offsets
        y1 -= 70;
        y2 -= 70;
        x1 += 4;
        x2 += 4;


        context.beginPath();
        context.moveTo(x1,y1);
        context.lineTo(x2,y2);
        context.lineWidth = 3;
        context.stroke();
        context.closePath();

        if(!emit){
            return;
        }

        const emitToServer={
            x1,x2,y1,y2
        };

        socket.emit('draw',emitToServer);
    }

    canvas.addEventListener('mousedown',onMouseDown);
    canvas.addEventListener('mouseup',onMouseUp);
    canvas.addEventListener('mousemove',onMouseMove);
    canvas.addEventListener('mouseout',onMouseUp); // Stop drawing same as mouseUp
    
    function onMouseDown(e) {
        current.x1=e.clientX;
        current.y1=e.clientY;
        drawing=true;
    }

    function onMouseUp(e) {
        drawLine(current.x1,current.y1,e.clientX,e.clientY);
        drawing=false;
    }

    function onMouseMove(e) {
        drawLine(current.x1,current.y1,e.clientX,e.clientY);
        current.x1=e.clientX;
        current.y1=e.clientY;
    }

    function drawFromServer(data) {

        if(drawing){

            drawLine(data.x1-4,data.y1+70,data.x2-4,data.y2+70,false);
            // Don't emit again as it will result in infinite loop

        }
         else{
            drawing=true;
            // data.y1+70 as 70 will get subtracted twice because we are sending y1=y1-70 to server
            // And again in drawLine we will subtract 70
            drawLine(data.x1-4,data.y1+70,data.x2-4,data.y2+70,false);
            // Don't emit again as it will result in infinite loop
            drawing=false;
            // We need to set it to false again. Else won't stop on mouse up
        }


    }
    function sessionCreated(data) {

        // 1. Remove listening to draw
        socket.off('draw');

        // 2. Store it's sessionId on client side and where it should emit instead of draw
        currentSocket.sessionId=data.sessionId;
        currentSocket.emitTo='drawInSession';

        // 3. Show sessionId on frontEnd
        $('.header').empty().append('<div class="col">\n' +
            '            </div>\n' +
            '            <div class="col-2 font pt-1">\n' +
            '                SessionId:'+data.sessionId+'\n' +
            '            </div>')

        // 4. Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
    }



});
