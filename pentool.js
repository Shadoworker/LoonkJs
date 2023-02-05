 
 // Classes
 const LOONK_PATH_CLASS ='loonk_scene_path';
 const LOONK_PATH_CLASS_HOVER ='loonk_scene_path_hover';
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
   
    distanceOfPoint(_p) {
      return Math.sqrt(
        Math.pow(this.x - _p.x, 2) + Math.pow(this.y - _p.y, 2)
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
  constructor (isClosed = false) {

    this.m_points = [];
    this.m_isClosed = isClosed  

  }

  updateSelectedEndPoint(ep) {
      ep.selected = false
  }

  deleteSelected() {
    for(let i = 0, len = this.m_points.length; i < len; i++){
      if(this.m_points[i].selected){
        this.m_points.splice(i, 1)
        len = this.m_points.length
        i--
      }
    }
  }

  addEndPoint(oed, ed) {
    for(let i = 0, len = this.m_points.length; i < len; i++){
      if(this.m_points[i] === oed){
          this.m_points.splice(i + 1, 0, ed);
      }
    }
  }

  getPointSiblingInPath(_x, _y) // Gets the previous nearest point on path
  {

    for (let i = 0; i < this.m_points.length; i++) {
      const p = this.m_points[i];


      
    }

  }

  insertEndPoint(ed) {
    this.m_points.push(ed)
  }
}

/** PATH END */

 
/**
 *  
 * PEN
 * 
 */

const SCENE_WIDTH = 800;
const SCENE_HEIGHT = 600;

class Loonk {
    constructor (_sceneRef = '#scene', _width = SCENE_WIDTH, _height = SCENE_HEIGHT) {
    
    this.m_sceneWidth = _width;
    this.m_sceneHeight = _height;
    
    this.m_svg = document.querySelector(_sceneRef)
    this.m_controls = this.createControlsContainer();

    this.m_pathElements = [];

    this.m_paths = [];
    this.m_path = null;

  }
    start () {
  
      this.m_svg.setAttribute("width", this.m_sceneWidth)
      this.m_svg.setAttribute("height",  this.m_sceneHeight)
      


      this.active()

    }

    resetPath()
    {
            
      // // Presets
      this.m_drawing = false   
    
    }

    initPath()
    {
  
      this.m_drawing = true   
      this.m_dragging = false   
      this.m_editCpBalance = false  
      this.m_isNewEndPoint = false   
      this.m_currentSelectedPoint = null   
      this.m_draggingControlPoint = null   
      this.m_pathStarted = false;

      // Define controls container
      ControlPoint.prototype.m_controls = this.m_controls
      EndPoint.prototype.m_controls = this.m_controls
      
      this.m_path = new Path();
      this.m_paths.push(this.m_path)
      
      this.m_currentPath = this.createPathElement();
      this.m_pathElements.push(this.m_currentPath)

      // Init path inner point insertion
      this.observePath();

    }

    // select a path and (re)activate it
    selectPath(e)
    {
      var target = e.target;
      this.m_path = target.m_path; // Set new path to this element m_path property
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
  

      let pos = this.positionToCanvas(e.clientX, e.clientY)
      let selectedPath = this.getSelectedPath()
  
      this.m_dragging = true
      this.m_isNewEndPoint = false
      this.m_draggingControlPoint = false
      this.m_currentSelectedPoint = this.getPoint(e);
      
      
      if(!this.isControlPoint(this.m_currentSelectedPoint))
        this.updateSelectedEndPoint(this.m_currentSelectedPoint)
      


      if(this.m_currentSelectedPoint ){
        // if the endPoint exist
        this.m_currentSelectedPoint.selected = true;
  
        if(this.m_editCpBalance && !this.m_draggingControlPoint) {
          let cep = this.m_currentSelectedPoint
          cep.cpBalance = true
          cep.cp0.x = cep.cp1.x = cep.x
          cep.cp0.y = cep.cp1.y = cep.y
          this.m_isNewEndPoint = true
        }
  
        if(!this.m_draggingControlPoint && this.m_currentSelectedPoint === this.m_path.m_points[0] && this.m_path.m_points.length > 2){
            // click first endpoint
            // close path
            this.closePath()
        }
      } else {

          if(!this.m_drawing) return;

          this.m_currentSelectedPoint = this.createEndPoint(pos.x, pos.y)
          this.m_isNewEndPoint = true;

          if(this.m_editCpBalance && selectedPath){
              // add endpoint to selectedendpoint after
            selectedPath.path.addEndPoint(selectedPath.ep, this.m_currentSelectedPoint)
          }else {
            this.m_path.m_points.push(this.m_currentSelectedPoint)
          }
      }
      this.render()
    }
  
    onMouseMove(e) {
      e.preventDefault()

      if(!this.m_path.isClosed)
        this.setCursor("pen")


      if(!this.m_dragging) {
        return
      }

      let pos = this.positionToCanvas(e.clientX, e.clientY)
      let csp = this.m_currentSelectedPoint // current selected point

      if(this.m_isNewEndPoint){
          csp.cp1.x = pos.x
          csp.cp1.y = pos.y
  
          csp.cp0.x = csp.x * 2 - pos.x
          csp.cp0.y = csp.y * 2 - pos.y
      } else if (this.m_draggingControlPoint){
          // Dragging controlPoint

          if(this.m_editCpBalance){
              csp.cpBalance = false
          }
          this.m_draggingControlPoint.x = pos.x
          this.m_draggingControlPoint.y = pos.y

          csp.ep.calculateControlPoint(pos.x, pos.y, this.m_draggingControlPoint)

      } else if(this.m_currentSelectedPoint){

          this.setCursor("arrow")

          // Dragging endpoint
          let offset = {
            x: pos.x - csp.x,
            y: pos.y-csp.y
          }
          csp.x = pos.x
          csp.y = pos.y
  
          csp.cp1.x += offset.x
          csp.cp1.y += offset.y
          csp.cp0.x += offset.x
          csp.cp0.y += offset.y

      }
      this.render()
    }
    onMouseUp(e) { 

      this.m_dragging = false
      if(this.m_draggingControlPoint){
        if(this.m_draggingControlPoint.opposite) {
          delete this.m_draggingControlPoint.opposite.staticDistance
        }
        delete this.m_draggingControlPoint.opposite
        this.m_draggingControlPoint = false
      }
    }
  
    // key down: provide delete endPoint
    onKeyDown(e) {
      switch(e.key) {
        case "Delete": 
          e.preventDefault()
          this.deleteEndPoint()
          this.render()
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
  
    observePath()
    {

      this.m_currentPath.onmousedown = (e)=>{
        e.preventDefault();
        e.stopPropagation();

        let pos = this.positionToCanvas(e.clientX, e.clientY)
        let pointToInsert = this.createEndPoint(pos.x, pos.y)

        // Get the path portion and the insertion index
        var insertIndex = -1;
        var contactPoint = this.createSVGPoint(pos.x, pos.y)
        for (let i = 0; i < this.m_path.m_points.length; i++)  // Loop through all portions : -1 to avoid loop
        {
          // Get current point and next
          const p = this.m_path.m_points[i];
          var nextI = (i+1) > (this.m_path.m_points.length-1) ? 0 : (i+1);
          const nextP = this.m_path.m_points[nextI];

          // Create the portion 
          var portion = this.createHelperPath(p, nextP)
          this.m_svg.append(portion)
          // and check if current mouse pos is in this portion
          if(portion.isPointInStroke(contactPoint))
          {
            insertIndex = nextI;

            this.m_svg.removeChild(portion)

            break;
          }

          this.m_svg.removeChild(portion)

        }
 
        // Check if drawmode left
        if(!this.m_drawing)
        {
          if(insertIndex != -1) // Not in path
          this.selectPath(e)
          
          this.m_path.m_points.splice(insertIndex, 0, pointToInsert)

          this.render()
        }
 

      }

      this.m_currentPath.onmouseover = (e)=>{

        e.preventDefault();
        e.stopPropagation();

        let pos = this.positionToCanvas(e.clientX, e.clientY)
        // let pointToInsert = this.createEndPoint(pos.x, pos.y)

        // Get the path portion and the insertion index
        var insertIndex = -1;
        var contactPoint = this.createSVGPoint(pos.x, pos.y)
        for (let i = 0; i < this.m_path.m_points.length; i++)  // Loop through all portions : -1 to avoid loop
        {
          // Get current point and next
          const p = this.m_path.m_points[i];
          var nextI = (i+1) > (this.m_path.m_points.length-1) ? 0 : (i+1);
          const nextP = this.m_path.m_points[nextI];

          // Create the portion 
          var portion = this.createHelperPath(p, nextP)
          this.m_svg.append(portion)
          // and check if current mouse pos is in this portion
          if(portion.isPointInStroke(contactPoint))
          {
            insertIndex = nextI;

            this.m_svg.removeChild(portion)

            break;
          }

          this.m_svg.removeChild(portion)

        }

      }


    }

    createSVGPoint(_x, _y)
    {
      var p = this.m_svg.createSVGPoint()
      p.x = _x;
      p.y = _y;
      return p
    }
    createHelperPath(p1, p2)
    {

      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      // path.classList.add(LOONK_PATH_CLASS);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "transparent");
      path.setAttribute("stroke-width", 1.5);

      var curve = this.createBezier(p1, p2)
      var d = "M"+p1.x+ ","+p1.y + curve;
      path.setAttribute("d", d);

      return path;

    }
  
    closePath() {

      // Close current Path
      this.m_path.m_isClosed = true // Close previous path
      this.resetPath();



      this.setCursor("arrow")

    }

    setCursor(_cursor)
    {
      var toremove = _cursor == "arrow" ? "cursor_pen" : "cursor_arrow";
      this.m_svg.classList.remove(toremove)
      this.m_svg.classList.add("cursor_"+_cursor)

    }

    createPathElement()
    {
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute("id", LOONK_PATH_CLASS+"_"+this.m_pathElements.length);
      path.classList.add(LOONK_PATH_CLASS);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "black");
      path.setAttribute("stroke-width", 1.5);

      
      path.m_path = this.m_path; // set path ref
      this.m_svg.prepend(path)
      this.m_currentPath = path
      return path;
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
        
      for(let i = 0, len = this.m_path.length; i < len; i++){
          if(this.m_path.m_points[i].selected){
             var selectedPath = {
              path: this.m_path,
              ep: this.m_path.m_points[i]
            }
            return selectedPath;
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

    updateSelectedEndPoint() {
      this.m_path.m_points.forEach((ep) => {
        this.m_path.updateSelectedEndPoint(ep)
      })
    }
  
    createEndPoint(x, y) {
      let ep = new EndPoint(x, y)
      ep.selected = true
      return ep
    }
  
    // delete point
    deleteEndPoint() {

      this.m_path.deleteSelected()
       
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
        this.m_draggingControlPoint = p;
        return p;
      }
      return null;
    }

    // render the spline
    render() {
      let ep, prev_ep
  
      this.m_currentPath.setAttribute("d", "")
      this.m_pathStarted = false;
      this.m_svg.querySelector('.loonk_controls_box').innerHTML = null;

      
      let len = this.m_path.m_points.length
      for(let i = 0; i < len; i++) {
        ep = this.m_path.m_points[i]
        ep.printControlPoints()
        if(!this.m_pathStarted)
        {
            this.m_currentPath.setAttribute("d", "M"+ep.x + "," + ep.y)
            this.m_pathStarted = true
        }
        if(i > 0) {
          // draw line
          prev_ep = this.m_path.m_points[i - 1];
          this.bezierCurveTo(prev_ep, ep)
        }
      }
      if(this.m_path.m_isClosed){
          prev_ep = this.m_path.m_points[len - 1]
          ep = this.m_path.m_points[0]
          this.bezierCurveTo(prev_ep, ep)

          // Init new path....
          // this.initPath()

      }

    }
  
    bezierCurveTo(prev_ep, ep) {
    
        var d = this.m_currentPath.getAttribute('d');
        d += this.createBezier(prev_ep, ep)
        this.m_currentPath.setAttribute("d", d)
        
    }
    createBezier(prev_ep, ep)
    {
      return 'C'+ prev_ep.cp1.x + "," + prev_ep.cp1.y + " " +
      ep.cp0.x + "," + ep.cp0.y + " " +
      ep.x + "," + ep.y;
      
    }
  }
  
/** PEN END */


/**
 * 
 * MAIN
 * 
 */

window.addEventListener('load',()=>{

    // Use class Loonk here 
    let loonk = new Loonk('#scene')
    loonk.start()
    loonk.initPath();

}, false);
 

/**
 * MAIN END
 */
