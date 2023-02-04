 
 // Classes
 const END_POINT_CLASS ='loonk_controls_box_endpoint';
 const CONTROL_POINT_CLASS ='loonk_controls_box_controlpoint';
// Colors
 const POINT_COLOR = "#DA2F74";
 const POINT_BORDER_COLOR = "#FFFFFF";
 const LINE_COLOR = "#E193B2";
/**
 * CONTROL POINT
 * 
 */
  const pointStyle = {
    control_point_radius: 4,
    control_point_color: '#005cf9'
  }
 
  class ControlPoint {
    constructor(x, y) {
      this.x = x || 0
      this.y = y || 0
      this.selected = false // controlpoint 
      this.ep = null; // which ep this cp belongs
      this.element = null;
    }

    /*  */
    draw() {

      let svgControlPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      svgControlPoint.setAttribute('cx', this.x);
      svgControlPoint.setAttribute('cy', this.y);
      svgControlPoint.setAttribute('r', 3);
      svgControlPoint.setAttribute('fill', POINT_COLOR+'66');
      svgControlPoint.setAttribute('stroke', POINT_COLOR);
      svgControlPoint.setAttribute('stroke-width', 1);
      svgControlPoint.classList.add(CONTROL_POINT_CLASS)

      // Set both refs
      this.element = svgControlPoint;
      svgControlPoint._point = this;

      this.m_controls.appendChild(svgControlPoint)

    }
   
     
  }

/** CONTROL POINT END  */

/**
 * ENDPOINT
 */

const endpointStyle = {
    end_point_length: 5,
    mouse_end_point_length: 10,
    end_point_color: '#5d5d5d', //
    stroke_width: 2, //
    fill_color: '#ffffff', // 
    hover_fill_color: '#ffc107' //
  }
 class EndPoint {
    constructor(x, y, cp0, cp1) {
      this.x = x || 0
      this.y = y || 0
      this.selected = false // endpoint 
      this.cp0 = cp0 || new ControlPoint(x, y)
      this.cp1 = cp1 || new ControlPoint(x, y)
      this.cpBalance = true  //  
      this.element = null;

      // Set owner
      this.cp0.ep = this;
      this.cp1.ep = this;

    }
  
    draw() {
      
      let svgEndPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      svgEndPoint.setAttribute('cx', this.x);
      svgEndPoint.setAttribute('cy', this.y);
      svgEndPoint.setAttribute('r', 4);
      svgEndPoint.style.position = "relative";
      svgEndPoint.style.zIndex = 2;

      var color = POINT_COLOR+('F1'); // +opacity
      var stroke = POINT_COLOR;
      if(!this.selected) 
      {
        color = POINT_BORDER_COLOR;
        stroke = POINT_COLOR;
      }

      svgEndPoint.setAttribute('fill', color);
      svgEndPoint.setAttribute('stroke', stroke);
      svgEndPoint.setAttribute('stroke-width', 1);
      svgEndPoint.classList.add(END_POINT_CLASS)

      // Set both refs
      this.element = svgEndPoint;
      svgEndPoint._point = this;

      this.m_controls.appendChild(svgEndPoint)
       
    }
    
    printControlPoints(ratio) {
      ratio = ratio || 1
      this.draw();
      if(!this.selected) {
        return
      }
      if(this.cp0.x !== this.x || this.cp0.y !== this.y){
        this.cp0.draw();
        this.line(this.cp0.x, this.cp0.y, this.x,this.y)
      }
      if(this.cp1.x !== this.x || this.cp1.y !== this.y){
        this.cp1.draw();
        this.line(this.cp1.x, this.cp1.y, this.x,this.y)
      }
    }
    // draw line
    line(x1, y1, x2, y2){
     
      let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', LINE_COLOR);
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.classList.add('loonk_controls_box_endpoint_line')
      line.style.position = "relative";
      line.style.zIndex = 1;
      line.style.pointerEvents = "none";

      this.m_controls.appendChild(line)


    }
   
    distanceOfPoint(cp) {
      return Math.sqrt(
        Math.pow(this.x - cp.x, 2) + Math.pow(this.y - cp.y, 2)
      )
    }
  
    calculateControlPoint(x, y, cp) {
      if(this.cpBalance) {
        cp.opposite = (
          cp === this.cp0 ? this.cp1 : this.cp0
        )
        cp.opposite.staticDistance = cp.opposite.staticDistance
                                                ? cp.opposite.staticDistance 
                                                : this.distanceOfPoint(cp.opposite)
  
        let staticDistance = cp.opposite.staticDistance
        let dynamicDistance = this.distanceOfPoint(cp)
  
        cp.opposite.x = staticDistance / dynamicDistance * (this.x - x) + this.x
        cp.opposite.y = staticDistance / dynamicDistance * (this.y - y) + this.y
      }
      cp.x = x
      cp.y = y
    }
  }

/**
 * ENDPOINT END
 */


/**
 * PATH
 */

class Path{
  constructor (isClose = false) {

    this.isClose = isClose  

  }

  updateSelectedEndPoint() {
    this.forEach((ep) => {
      ep.selected = false
    })
  }

  deleteSelected() {
    for(let i = 0, len = this.length; i < len; i++){
      if(this[i].selected){
        this.splice(i, 1)
        len = this.length
        i--
      }
    }
  }

  addEndPoint(oed, ed) {
    for(let i = 0, len = this.length; i < len; i++){
      if(this[i] === oed){
          this.splice(i + 1, 0, ed);
      }
    }
  }
}
Object.setPrototypeOf(Path.prototype, Array.prototype);

/** PATH END */

 
/**
 *  
 * PEN
 * 
 */

const SCENE_WIDTH = 800;
const SCENE_HEIGHT = 600;

class Pen {
    constructor (_sceneRef = '#scene', _width = SCENE_WIDTH, _height = SCENE_HEIGHT) {
    
    this.m_sceneWidth = _width;
    this.m_sceneHeight = _height;
    
    this.m_svg = document.querySelector(_sceneRef)
    this.m_controls = this.createControlsContainer();
    this.currentPath = document.querySelector("#scene_path_0")
    this.stroke_color = '#ffc107' //  
    }
    reset () {
      this.paths = []
      this.paths.push(new Path())
      this.dragging = false  //  
      this.editCpBalance = false //  
      this.isNewEndPoint = false  //  
      this.currentSelectedPoint = null  //  
      this.draggingControlPoint = null  //  
      this.pathStarted = false;
  
      // Define controls container
      ControlPoint.prototype.m_controls = this.m_controls
      EndPoint.prototype.m_controls = this.m_controls
      
      
      this.m_svg.setAttribute("width", this.m_sceneWidth)
      this.m_svg.setAttribute("height",  this.m_sceneHeight)
      
      this.active()

    }
  
    // the positoin on canvas
    positionToCanvas (x, y) {
      let bbox = this.m_svg.getBoundingClientRect()
      return {
        x: x - bbox.left * (this.m_svg.clientWidth  / bbox.width),
        y: y - bbox.top  * (this.m_svg.clientHeight / bbox.height)
      }
    }
    // mouse click
    onMouseDown(e) {
  
      let location = this.positionToCanvas(e.clientX, e.clientY)
      let selectedPath = this.getSelectedPath()
  
      this.dragging = true
      this.isNewEndPoint = false
      this.draggingControlPoint = false
      // this.currentSelectedPoint = this.isExistPoint(location.x, location.y)
      this.currentSelectedPoint = this.getPoint(e);
      
      
      if(!this.isControlPoint(this.currentSelectedPoint))
        this.updateSelectedEndPointEndPoint()
      


      if(this.currentSelectedPoint ){
        // if the endPoint exist
        this.currentSelectedPoint.selected = true;
  
        if(this.editCpBalance && !this.draggingControlPoint) {
          let cep = this.currentSelectedPoint
          cep.cpBalance = true
          cep.cp0.x = cep.cp1.x = cep.x
          cep.cp0.y = cep.cp1.y = cep.y
          this.isNewEndPoint = true
        }
  
        if(!this.draggingControlPoint && this.currentSelectedPoint === this.paths[this.paths.length -1][0] && this.paths[this.paths.length -1].length > 2){
            // click first endpoint
            // close path
            this.createPath()
        }
      } else {
         this.currentSelectedPoint = this.createEndPoint(location.x, location.y)
         this.isNewEndPoint = true;
         if(this.editCpBalance && selectedPath){
            // add endpoint to selectedendpoint after
           selectedPath.path.addEndPoint(selectedPath.ep, this.currentSelectedPoint)
        }else {
          this.paths[this.paths.length - 1].push(this.currentSelectedPoint)
        }
      }
      this.renderer()
    }
  
    onMouseMove(e) {
      e.preventDefault()
  
      if(!this.dragging) {
        return
      }
      let loc = this.positionToCanvas(e.clientX, e.clientY)
      let csp = this.currentSelectedPoint // current selected point
  
      this.m_svg.style.cursor = 'move'
  
      if(this.isNewEndPoint){
          csp.cp1.x = loc.x
          csp.cp1.y = loc.y
  
          csp.cp0.x = csp.x * 2 - loc.x
          csp.cp0.y = csp.y * 2 - loc.y
      } else if (this.draggingControlPoint){
          // Dragging controlPoint

          if(this.editCpBalance){
              csp.cpBalance = false
          }
          this.draggingControlPoint.x = loc.x
          this.draggingControlPoint.y = loc.y

          csp.ep.calculateControlPoint(loc.x, loc.y, this.draggingControlPoint)
      } else {
          // Dragging endpoint
          let offset = {
            x: loc.x - csp.x,
            y: loc.y-csp.y
          }
          csp.x = loc.x
          csp.y = loc.y
  
          csp.cp1.x += offset.x
          csp.cp1.y += offset.y
          csp.cp0.x += offset.x
          csp.cp0.y += offset.y

      }
      this.renderer()
    }
    onMouseUp(e) {
      this.m_svg.style.cursor = 'default'
      this.dragging = false
      if(this.draggingControlPoint){
        if(this.draggingControlPoint.opposite) {
          delete this.draggingControlPoint.opposite.staticDistance
        }
        delete this.draggingControlPoint.opposite
        this.draggingControlPoint = false
      }
    }
  
    // key down: provide delete endPoint
    onKeyDown(e) {
      switch(e.key) {
        case "Delete": 
          e.preventDefault()
          this.deleteEndPoint()
          this.renderer()
      }
    }
    // active the canvas's eventListner
    active() {
      let that = this
      let listeners = {
        mousedown(e) { that.onMouseDown(e) },
        mousemove(e) { that.onMouseMove(e) },
        mouseup(e) { that.onMouseUp(e) },
        keydown(e) { that.onKeyDown(e) }
    };
      this.m_svg.addEventListener('mousedown', listeners.mousedown, false)
      this.m_svg.addEventListener('mousemove', listeners.mousemove, false)
      this.m_svg.addEventListener('mouseup', listeners.mouseup, false)
      document.addEventListener('keydown', listeners.keydown, false)
    }
  
  
    createPath() {
      this.paths[this.paths.length - 1].isClose = true // Close previous path
      this.paths.push(new Path()) // Add new one
    }

    createControlsContainer()
    {
      let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.classList.add("loonk_controls_box");
      this.m_svg.appendChild(group)
      this.m_controls = group;
      return group;
    }
  
    getSelectedPath() {
      for(let i = 0, len1 = this.paths.length; i < len1; i++){
        for(let j = 0, len2 = this.paths[i].length; j < len2; j++){
          if(this.paths[i][j].selected){
             var selectedPath = {
              path: this.paths[i],
              ep: this.paths[i][j]
            }
            return selectedPath;
          }
        }
      }
      return null
    }
  
    isControlPoint(_point)
    {
      if(_point)
      {
        return (_point.element.classList.contains(CONTROL_POINT_CLASS))
      }
      return false;
    }

    updateSelectedEndPointEndPoint() {
      this.paths.forEach((path) => {
          path.updateSelectedEndPoint()
      })
    }
  
    createEndPoint(x, y) {
      let ep = new EndPoint(x, y)
      ep.selected = true
      return ep
    }
  
    // delete point
    deleteEndPoint() {
      let paths = this.paths
      for(let i = 0, l = paths.length; i < l; i++){
        paths[i].deleteSelected()
        if(paths[i].length === 0 && (i + 1 !== l)){
          paths.splice(i, 1)
          l = paths.length
          i--
        }
      }
    }
  

    getPoint(e)
    {
      var _el = e.target;
      if(_el.classList.contains(END_POINT_CLASS))
      {
        return _el._point;
      }
      else if(_el.classList.contains(CONTROL_POINT_CLASS))
      {
        var p = _el._point;
        this.draggingControlPoint = p;
        return p;
      }
      return null;
    }

    // renderer the spline
    renderer() {
      let ep, prev_ep, ctx = this.ctx
  
      this.currentPath.setAttribute("d", "")
      this.pathStarted = false;
      this.m_svg.querySelector('.loonk_controls_box').innerHTML = null;

     
      this.paths.forEach((path) => {
        let len = path.length
        for(let i = 0; i < len; i++) {
          ep = path[i]
          ep.printControlPoints()
          if(!this.pathStarted)
          {
              this.currentPath.setAttribute("d", "M"+ep.x + "," + ep.y)
              this.pathStarted = true
          }
          if(i > 0) {
            // draw line
            prev_ep = path[i - 1];
            this.bezierCurveTo(prev_ep, ep, ctx)
          }
        }
        if(path.isClose){
            prev_ep = path[len - 1]
            ep = path[0]
            this.bezierCurveTo(prev_ep, ep, ctx)
        }
      })
    }
  
    bezierCurveTo(prev_ep, ep, ctx) {
    
        var d = this.currentPath.getAttribute('d');
        d += 'C'+ prev_ep.cp1.x + "," + prev_ep.cp1.y + " " +
        ep.cp0.x + "," + ep.cp0.y + " " +
        ep.x + "," + ep.y;

        this.currentPath.setAttribute("d", d)
        
    }
  }
  
/** PEN END */


/**
 * 
 * MAIN
 * 
 */

window.addEventListener('load',()=>{

    // Use class Pen here 
    let pen = new Pen('#scene')
    pen.reset()

}, false);
 

/**
 * MAIN END
 */
