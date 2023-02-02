 
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
    }
    
    /*  */
    draw(ratio) {
      ratio = ratio || 1
      this.ctx.beginPath()
      this.ctx.arc(this.x * ratio, this.y * ratio, pointStyle.control_point_radius, 0, Math.PI * 2, false)
    }
    print(ratio) {
      this.draw(ratio)
      this.ctx.save()
      this.ctx.strokeStyle = pointStyle.control_point_color
      this.ctx.fillStyle = pointStyle.control_point_color
      this.ctx.stroke()
      this.ctx.fill()
      this.ctx.restore()
    }
    isInPoint(x, y) {
      this.draw()
      if(this.ctx.isPointInPath(x, y)) {
        return true
      }
      return false
    }
  }

/** CONTROL POINT END  */

/**
 * PATH
 */

 class Path{
    constructor (isClose = false) {
      // super()
      this.isClose = isClose  //  
  
    }
  
    isInPoint(x, y) {
      let cep
      for(let i = 0,len = this.length; i < len; i++){
        cep = this[i].isInPoint(x, y)
        if(cep){
          return {
              ep: this[i], 
              cp : cep instanceof ControlPoint ? cep : null
          }
        }
      }
      return null
    }
  
    removeSelected() {
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
    }
  
    draw(ratio) {
      ratio = ratio || 1
      // this.ctx.beginPath()
      // this.ctx.arc(this.x * ratio, this.y * ratio, endpointStyle.end_point_length, 0, Math.PI * 2, false)

      var controlsBox = this.svg.getElementsByClassName("loonk_controls_box")[0];
    //   let anchor = new Anchor(this.x, this.y);

      let arm1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      arm1.setAttribute('cx', this.x);
      arm1.setAttribute('cy', this.y);
      arm1.setAttribute('r', 5);
      arm1.setAttribute('fill', '#f8e');
      arm1.classList.add('loonk_controls_box_handle1')

      controlsBox.appendChild(arm1)
      // controlsBox.appendChild(anchor.ref)
    }
  
    print(ratio) {
      ratio = ratio || 1
      this.draw(ratio)
      this.ctx.save()
      this.ctx.strokeStyle = endpointStyle.end_point_color
      this.ctx.fillStyle = endpointStyle.fill_color
      this.ctx.lineWidth = endpointStyle.stroke_width
      if(this.selected){
        this.ctx.fillStyle = endpointStyle.hover_fill_color
      }
      this.ctx.fill()
      this.ctx.stroke()
      this.ctx.restore()
    }
    
    printControlPoints(ratio) {
      ratio = ratio || 1
      this.print(ratio)
      if(!this.selected) {
        return
      }
      if(this.cp0.x !== this.x || this.cp0.y !== this.y){
        this.cp0.print(ratio)
        this.line(this.cp0.x, this.cp0.y, this.x,this.y, this.ctx, endpointStyle.end_point_color)
      }
      if(this.cp1.x !== this.x || this.cp1.y !== this.y){
        this.cp1.print(ratio)
        this.line(this.cp1.x, this.cp1.y, this.x,this.y, this.ctx, endpointStyle.end_point_color)
      }
    }
    // draw line
    line(x1, y1, x2, y2, ctx, color){
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.strokeStyle = color
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.restore()


      let line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('stroke', "#af1");
      line1.setAttribute('x1', x1);
      line1.setAttribute('y1', y1);
      line1.setAttribute('x2', x2);
      line1.setAttribute('y2', y2);
      line1.classList.add('loonk_controls_box_handle1_line')

      var controlsBox = this.svg.getElementsByClassName("loonk_controls_box")[0];
      controlsBox.appendChild(line1)


    }
  
    isInPoint(x, y) {
      this.draw()
      if(this.ctx.isPointInPath(x, y)) {
          return this
      }
      if(this.selected){
        if(this.cp0.isInPoint(x, y)){
          return this.cp0;
        }
        if(this.cp1.isInPoint(x, y)){
          return this.cp1;
        }
      }
      return false
    }
  
    distanceOfPoint(controlPoint) {
      return Math.sqrt(
        Math.pow(this.x - controlPoint.x, 2) + Math.pow(this.y - controlPoint.y, 2)
      )
    }
  
    calculateControlPoint(x, y, controlPoint) {
      if(this.cpBalance) {
        controlPoint.counterpart = (
          controlPoint === this.cp0 ? this.cp1 : this.cp0
        )
        controlPoint.counterpart.staticDistance = controlPoint.counterpart.staticDistance
                                                ? controlPoint.counterpart.staticDistance 
                                                : this.distanceOfPoint(controlPoint.counterpart)
  
        let staticDistance = controlPoint.counterpart.staticDistance
        let dynamicDistance = this.distanceOfPoint(controlPoint)
  
        controlPoint.counterpart.x = staticDistance / dynamicDistance * (this.x - x) + this.x
        controlPoint.counterpart.y = staticDistance / dynamicDistance * (this.y - y) + this.y
      }
      controlPoint.x = x
      controlPoint.y = y
    }
  }

/**
 * ENDPOINT END
 */


/**
 * 
 * ANCHOR
 * 
 * -------- VEC2 --------------
 */

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get length () {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    multiplyScalar (s) {
        return new Vec2(this.x * s, this.y * s);
    }

    // anti-clockwise rotation
    rotate (angle) {
        let sin = Math.sin(angle * Math.PI / 180);
        let cos = Math.cos(angle * Math.PI / 180);
        return new Vec2(this.x * cos - this.y * sin, this.y * cos + this.x * sin);
    }
}

// --------------------------

class Anchor {
    constructor(x, y, isInsert = false) {
        this.eventList = {};
        this.arm1 = new Vec2(0, 0);
        this.arm2 = new Vec2(0, 0);
        this.size = 8;
        this.armSize = this.size / 2;
        this.x = x;
        this.y = y;
        this.fill = '#fff';
        this.stroke = '#000';
        this.armFill = '#00ffaa';
        this.lineColor = '#000';
        this.relative = true;
        this.curves = [];
        this.isInsert = isInsert;
        this.ref = this.getElement();
    }

    on (name, fn) {
        if (!this.eventList[name]) {
            this.eventList[name] = [];
        }
        this.eventList[name].push(fn);
    }

    off (name, fn) {
        if (!this.eventList[name]) {
            // console.error('no event ' + name);
            return;
        }
        let index = this.eventList[name].indexOf(fn);
        if (index >= 0) {
            this.eventList[name].splice(index, 1);
        }
    }

    dispatch () {
        let name = Array.prototype.shift.call(arguments);
        let args = Array.prototype.slice.call(arguments);
        if (!this.eventList[name]) {
            // console.error('no event ' + name);
            return;
        }
        for (let i = 0; i < this.eventList[name].length; i++) {
            let fn = this.eventList[name][i];
            fn.apply(this, args);
        }
    }

    getElement () {
        let that = this;
        let wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        wrapper.classList.add('loonk_controls_box')
        let point = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        point.setAttribute('x', this.x);
        point.setAttribute('y', this.y);
        point.setAttribute('width', this.size);
        point.setAttribute('height', this.size);
        point.setAttribute('fill', this.fill);
        point.setAttribute('stroke', this.stroke);
        point.classList.add('loonk_controls_box_base')


        let arm1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        arm1.setAttribute('cx', this.x + this.arm1.x + this.size / 2);
        arm1.setAttribute('cy', this.y + this.arm1.y + this.size / 2);
        arm1.setAttribute('r', this.armSize);
        arm1.setAttribute('fill', this.armFill);
        arm1.classList.add('loonk_controls_box_handle1')


        let arm2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        arm2.setAttribute('cx', this.x + this.arm2.x + this.size / 2);
        arm2.setAttribute('cy', this.y + this.arm2.y + this.size / 2);
        arm2.setAttribute('r', this.armSize);
        arm2.setAttribute('fill', this.armFill);
        arm2.classList.add('loonk_controls_box_handle2')

        let line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('stroke', this.armFill);
        line1.setAttribute('x1', this.x);
        line1.setAttribute('y1', this.y);
        line1.setAttribute('x2', this.x + this.arm1.x);
        line1.setAttribute('y2', this.y + this.arm1.y);
        line1.classList.add('loonk_controls_box_handle1_line')


        let line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('stroke', this.armFill);
        line2.setAttribute('x1', this.x + this.size / 2);
        line2.setAttribute('y1', this.y + this.size / 2);
        line2.setAttribute('x2', this.x + this.arm2.x + this.armSize / 2);
        line2.setAttribute('y2', this.y + this.arm2.y + this.armSize / 2);
        line2.classList.add('loonk_controls_box_handle2_line')

        // arm1.style.display = 'none';
        // arm2.style.display = 'none';


        point.addEventListener('mousedown', function (e) {
            e.stopPropagation();
            e.preventDefault();
            let ctrlKey = e.ctrlKey;
            if (/mac/i.test(navigator.platform)) {
                ctrlKey = e.metaKey;
            }
            if (ctrlKey) {
                let initX = that.x;
                let initY = that.y;
                that.dispatch('select');
                let move = function (ev) {
                    let offsetX = ev.clientX - e.clientX;
                    let offsetY = ev.clientY - e.clientY;
                    that.x = initX + offsetX;
                    that.y = initY + offsetY;
                    that.update();
                }
                let up = function () {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                }

                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);
            } else if (e.altKey) {
                let event = new MouseEvent('mousedown', { clientX: e.clientX, clientY: e.clientY });
                arm1.dispatchEvent(event);
            } else if (that.isHead) {
                that.dispatch('loop');
            } else if (!that.isInsert) {
                that.delete();
                that = null;
            }
        });
        arm1.onmousedown = function (e) {
            e.preventDefault();
            e.stopPropagation();
            that.dispatch('select');
            let arm1StartPosX = e.clientX;
            let arm1StartPosY = e.clientY;
            let arm1InitPosX = that.arm1.x;
            let arm1InitPosY = that.arm1.y;
            let arm2InitPosX = that.arm2.x;
            let arm2InitPosY = that.arm2.y;
            let move = function (ev) {
                let offsetX = ev.clientX - arm1StartPosX;
                let offsetY = ev.clientY - arm1StartPosY;
                that.arm1.x = arm1InitPosX + offsetX;
                that.arm1.y = arm1InitPosY + offsetY;
                if (that.relative) {
                    that.arm2.x = arm2InitPosX - offsetX;
                    that.arm2.y = arm2InitPosY - offsetY;
                }
                that.update();
            }

            let up = function (e) {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        }


        arm2.onmousedown = function (e) {
            e.preventDefault();
            e.stopPropagation();
            that.dispatch('select');
            let arm2StartPosX = e.clientX;
            let arm2StartPosY = e.clientY;
            let arm1InitPosX = that.arm1.x;
            let arm1InitPosY = that.arm1.y;
            let arm2InitPosX = that.arm2.x;
            let arm2InitPosY = that.arm2.y;
            let move = function (ev) {
                let offsetX = ev.clientX - arm2StartPosX;
                let offsetY = ev.clientY - arm2StartPosY;
                that.arm2.x = arm2InitPosX + offsetX;
                that.arm2.y = arm2InitPosY + offsetY;
                if (that.relative) {
                    that.arm1.x = arm1InitPosX - offsetX;
                    that.arm1.y = arm1InitPosY - offsetY;
                }
                that.update();
            }

            let up = function (e) {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        }

        wrapper.appendChild(line1);
        wrapper.appendChild(line2);
        wrapper.appendChild(arm2);
        wrapper.appendChild(arm1);
        wrapper.appendChild(point);
        this.pointElement = point;
        this.arm1Element = arm1;
        this.arm2Element = arm2;
        this.line1Element = line1;
        this.line2Element = line2;
        return wrapper;

    }

    update () {
        this.pointElement.setAttribute('x', this.x);
        this.pointElement.setAttribute('y', this.y);
        this.arm1Element.setAttribute('cx', this.x + this.arm1.x + this.size / 2);
        this.arm1Element.setAttribute('cy', this.y + this.arm1.y + this.size / 2);
        this.arm2Element.setAttribute('cx', this.x + this.arm2.x + this.size / 2);
        this.arm2Element.setAttribute('cy', this.y + this.arm2.y + this.size / 2);

        this.line1Element.setAttribute('x1', this.x + this.size / 2);
        this.line1Element.setAttribute('y1', this.y + this.size / 2);
        this.line1Element.setAttribute('x2', this.x + this.arm1.x + this.armSize);
        this.line1Element.setAttribute('y2', this.y + this.arm1.y + this.armSize);

        this.line2Element.setAttribute('x1', this.x + this.size / 2);
        this.line2Element.setAttribute('y1', this.y + this.size / 2);
        this.line2Element.setAttribute('x2', this.x + this.arm2.x + this.armSize);
        this.line2Element.setAttribute('y2', this.y + this.arm2.y + this.armSize);
        this.dispatch('update');
    }

    delete () {
        this.ref.remove();
        this.dispatch('delete');
        this.ref = null;
        this.leftLine = null;
        this.rightLine = null;
    }

    hideArm1 () {
        this.arm1Element.style.display = 'none';
        this.line1Element.style.display = 'none';
    }

    hideArm2 () {
        this.arm2Element.style.display = 'none';
        this.line2Element.style.display = 'none';
    }

    showArm1 () {
        this.arm1Element.style.display = 'block';
        this.line1Element.style.display = 'block';
    }
    showArm2 () {
        this.arm2Element.style.display = 'block';
        this.line2Element.style.display = 'block';
    }

    addCurve (curve) {
        this.curves.push(curve);
    }

    deleteCurve (curve) {
        let index = this.curves.indexOf(curve);
        if (index > -1) {
            this.curves.splice(index, 1);
        }
    }
}


/**
 * ANCHOR END
 */

/**
 *  
 * PEN
 * 
 */

const SCENE_WIDTH = 800;
const SCENE_HEIGHT = 600;

class Pen {
    constructor (targetCvs = '#pen', _width = SCENE_WIDTH, _height = SCENE_HEIGHT) {
    
    this.sceneWidth = _width;
    this.sceneHeight = _height;
    
    this.canvas = document.querySelector(targetCvs)
    this.svg = document.querySelector("#scene")
    this.controls = document.querySelector("#loonk_controls_box")
    this.currentPath = document.querySelector("#scene_path_0")
    this.ctx = this.canvas.getContext('2d')
    this.stroke_color = '#ffc107' // 线条颜色
    }
    reset () {
      this.paths = []
      this.paths.push(new Path())
  
      this.dragging = false  //  
      this.editCpBalance = false //  
      this.isNewEndPoint = false  //  
      this.currentEndPoint = null  //  
      this.draggingControlPoint = null  //  
      this.pathStarted = false;
      // this.zoomRatio = 1  //  
  
      ControlPoint.prototype.ctx = this.ctx
      ControlPoint.prototype.svg = this.svg
      EndPoint.prototype.ctx = this.ctx
      EndPoint.prototype.svg = this.svg
      EndPoint.prototype.canvas = this
   
      this.canvas.width =  this.sceneWidth
      this.canvas.height = this.sceneHeight

      this.svg.setAttribute("width", this.sceneWidth)
      this.svg.setAttribute("height",  this.sceneHeight)
      this.active()
    }
  
    // the positoin on canvas
    positionToCanvas (x, y) {
      let bbox = this.canvas.getBoundingClientRect()
      return {
        x: x - bbox.left * (this.canvas.width  / bbox.width),
        y: y - bbox.top  * (this.canvas.height / bbox.height)
      }
    }
    // mouse click
    onMouseDown(e) {
  
      let location = this.positionToCanvas(e.clientX, e.clientY)
      let selectedPath = this.getSelectedPath()
  
      this.dragging = true
      this.isNewEndPoint = false
      this.draggingControlPoint = false
      this.currentEndPoint = this.isExistPoint(location.x, location.y)
      this.removeSelectedEndPoint()
  
      if(this.currentEndPoint ){
        // if the endPoint exist
        this.currentEndPoint.selected = true;
  
        if(this.editCpBalance && !this.draggingControlPoint) {
          let ced = this.currentEndPoint
          ced.cpBalance = true
          ced.cp0.x = ced.cp1.x = ced.x
          ced.cp0.y = ced.cp1.y = ced.y
          this.isNewEndPoint = true
        }
  
        if(!this.draggingControlPoint && this.currentEndPoint === this.paths[this.paths.length -1][0] && this.paths[this.paths.length -1].length > 2){
            // click first endpoint
            // close path
            this.createPath()
        }
      } else {
         this.currentEndPoint = this.createEndPoint(location.x, location.y)
         this.isNewEndPoint = true;
         if(this.editCpBalance && selectedPath){
            // add endpoint to selectedendpoint after
           selectedPath.path.addEndPoint(selectedPath.ep, this.currentEndPoint)
        }else {
          this.paths[this.paths.length - 1].push(this.currentEndPoint)
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
      let ced = this.currentEndPoint
  
      this.svg.style.cursor = 'move'
  
      if(this.isNewEndPoint){
          ced.cp1.x = loc.x
          ced.cp1.y = loc.y
  
          ced.cp0.x = ced.x * 2 - loc.x
          ced.cp0.y = ced.y * 2 - loc.y
      } else if (this.draggingControlPoint){
          // Dragging controlPoint
          console.log('dragging controlPoint')
  
          if(this.editCpBalance){
              ced.cpBalance = false
          }
          this.draggingControlPoint.x = loc.x
          this.draggingControlPoint.y = loc.y
          ced.calculateControlPoint(loc.x, loc.y, this.draggingControlPoint)
      } else {
          // Dragging endpoint
          let offset = {
            x: loc.x - ced.x,
            y: loc.y-ced.y
          }
          ced.x = loc.x
          ced.y = loc.y
  
          ced.cp1.x += offset.x
          ced.cp1.y += offset.y
          ced.cp0.x += offset.x
          ced.cp0.y += offset.y
      }
      this.renderer()
    }
    onMouseUp(e) {
      // console.log('mouseup', e)
      this.svg.style.cursor = 'default'
      this.dragging = false
      if(this.draggingControlPoint){
        if(this.draggingControlPoint.counterpart) {
          delete this.draggingControlPoint.counterpart.staticDistance
        }
        delete this.draggingControlPoint.counterpart
        this.draggingControlPoint = false
      }
    }
  
    // key down: provide delete endPoint
    onKeyDown(e) {
      switch(e.keyCode) {
        case 8: 
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
      this.svg.addEventListener('mousedown', listeners.mousedown, false)
      this.svg.addEventListener('mousemove', listeners.mousemove, false)
      this.svg.addEventListener('mouseup', listeners.mouseup, false)
      document.addEventListener('keydown', listeners.keydown, false)
    }
  
  
    createPath() {
      this.paths[this.paths.length - 1].isClose = true
      this.paths.push(new Path())
    }
  
    getSelectedPath() {
      for(let i = 0, len1 = this.paths.length; i < len1; i++){
        for(let j = 0, len2 = this.paths[i].length; j < len2; j++){
          if(this.paths[i][j].selected){
            return {
              path: this.paths[i],
              ep: this.paths[i][j]
            }
          }
        }
      }
      return null
    }
  
    removeSelectedEndPoint() {
      this.paths.forEach((path) => {
          path.removeSelected()
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
  
    isExistPoint(x, y) {
      let cep, i = 0, l
      for(l = this.paths.length; i< l; i++){
        cep = this.paths[i].isInPoint(x, y)
        if(cep){
          if(cep.cp instanceof ControlPoint){
              // set  controlpoint
              this.draggingControlPoint = cep.cp
          }
          return cep.ep
        }
      }
      return null
    }
    // renderer the spline
    renderer() {
      let ep, prev_ep, ctx = this.ctx
  
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.currentPath.setAttribute("d", "")
      this.pathStarted = false;
      this.svg.getElementsByClassName('loonk_controls_box')[0].innerHTML = null;

     
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
            // console.log("draw")
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
        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = this.stroke_color
        ctx.lineWidth = 2
        ctx.moveTo(prev_ep.x, prev_ep.y)


    
        var d = this.currentPath.getAttribute('d');
        d += 'C'+ prev_ep.cp1.x + "," + prev_ep.cp1.y + " " +
        ep.cp0.x + "," + ep.cp0.y + " " +
        ep.x + "," + ep.y;

        this.currentPath.setAttribute("d", d)
        
        ctx.bezierCurveTo(
            prev_ep.cp1.x, prev_ep.cp1.y,
            ep.cp0.x, ep.cp0.y,
            ep.x, ep.y
        )


        
        // ctx.quadraticCurveTo(prev_ep.cp1.x, prev_ep.cp1.y, ep.x, ep.y)
        ctx.stroke()
        ctx.restore()
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
    let pen = new Pen()
    pen.reset()

}, false);
 


/**
 * MAIN END
 */
