function Slider(y,x){
    this.x = x || 0 
    this.y = y || 0

    var input = document.createElement('input')
    this.html = input;
    this.html.type = "range";
    this.html.min = "0";
    this.html.max = "2";
    this.html.value = "0";
    this.html.step = "1";    
    this.html.onchange = "alert(this.value)"
    this.html.style = "position: absolute;top:0px;left:0px;	transform: rotate(270deg);width:40px;"
    this.html.className = "slider"
    this.game = [];
}