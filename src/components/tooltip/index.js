class Tooltip {

  static instance

  shift = 10

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this
    }
    return Tooltip.instance
  }

  initialize () {   
    this.element = document.createElement("div")
    this.element.className = "tooltip"
    
    document.addEventListener("pointerover", this.pointerOver)    
    document.addEventListener("pointerout", this.pointerOut)   
  }

  showTooltip(label) {
    this.element.innerHTML = label
    document.body.append(this.element)    
  }

  pointerOver = (event) => {
    const tooltipLabel = event.target?.dataset?.tooltip

    if (tooltipLabel) {
      this.showTooltip(tooltipLabel)
      document.addEventListener("pointermove", this.pointerMove)  
    }
  }

  pointerOut = (event) => {
    if (event.target?.dataset?.tooltip) {
      this.remove()
      document.removeEventListener("pointermove", this.pointerMove)  
    }
  }

  pointerMove = (event) => {
    this.element.style.left = event.pageX + this.shift + 'px';
    this.element.style.top =  event.pageY + this.shift + 'px';
  }

  remove() {
    if (this.element) {
        this.element.remove()
    }
  }

  destroy() {
    this.remove()
    this.element = null
    document.removeEventListener("pointerover", this.pointerOver)    
    document.removeEventListener("pointerout", this.pointerOut)   
    document.removeEventListener("pointermove", this.pointerMove)   
  }
}

export default Tooltip;