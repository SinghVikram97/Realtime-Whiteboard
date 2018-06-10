const socket=io();

$(document).ready(function () {

    const canvas=document.getElementById('canvas');
    const context = canvas.getContext('2d');

    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;

    socket.on('draw',drawFromServer);

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

            drawLine(data.x1,data.y1,data.x2,data.y2,false);
            // Don't emit again as it will result in infinite loop

        }
         else{
            drawing=true;
            drawLine(data.x1,data.y1,data.x2,data.y2,false);
            // Don't emit again as it will result in infinite loop
            drawing=false;
            // We need to set it to false again. Else won't stop on mouse up
        }


    }
    
});
