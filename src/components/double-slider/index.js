export default class DoubleSlider {

    constructor ({min, max, formatValue, selected = {} } = {}) {     

        if (min != undefined && max != undefined && min <= max) {
          this.min = min
          this.max = max
        } else {
          this.min = 0
          this.max = 200
        }
        this.rangeValue = this.max - this.min
        this.formatValue = formatValue
        this.from = selected?.from || this.min
        this.to = selected?.to || this.max
        this.subElements = {}

        this.render()
    }

    render() {
      this.renderElement()
      this.renderSubElements()  

      this.updatePoints()
    }

    renderElement() {
      this.element = document.createElement("div")
      this.element.className = "range-slider"
      this.element.innerHTML = this.sliderInnerHTML
      this.element.ondragstart = () => false
    }

    renderSubElements() {
      const subElements = this.element.querySelectorAll('[data-element]')      
      for (const subElement of subElements) {
        this.subElements[subElement.dataset.element] = subElement
      }

      this.subElements.thumbLeft.addEventListener("pointerdown", this.onPointerDown)
      this.subElements.thumbRight.addEventListener("pointerdown", this.onPointerDown)      
    }

    get sliderInnerHTML() {
      return `<span data-element="from">${this.formatValue ? this.formatValue(this.from) : this.from}</span>
                <div data-element="inner" class="range-slider__inner">
                  <span data-element="progress" class="range-slider__progress"></span>
                  <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
                  <span data-element="thumbRight" class="range-slider__thumb-right"></span>
                </div>
              <span data-element="to">${this.formatValue ? this.formatValue(this.to) : this.to }</span>`
    }

    onPointerDown = event => {
      event.preventDefault()

      this.dragging = event.target
      this.element.classList.add('range-slider_dragging')

      document.addEventListener("pointermove", this.onPointerMove);
      document.addEventListener("pointerup", this.onPointerUp);

      ({ left: this.innerLeft, right: this.innerRight, width: this.innerWidth } = this.subElements.inner.getBoundingClientRect());
    }

    onPointerMove = event => {
      event.preventDefault()

      if (this.dragging === this.subElements.thumbLeft) {
        let newLeft = (event.clientX - this.innerLeft) / this.innerWidth * 100
        if (newLeft < 0) {
          newLeft = 0
        }
        const leftFromRightThumb = 100 - parseFloat(this.subElements.thumbRight.style.right)
        if (newLeft > leftFromRightThumb) {
          newLeft = leftFromRightThumb
        }

        this.dragging.style.left = this.subElements.progress.style.left = newLeft + '%'
        this.from = this.min +  Math.floor(newLeft * this.rangeValue / 100)
        this.subElements.from.innerHTML = this.formatValue ? this.formatValue(this.from) : this.from
      }

      if (this.dragging === this.subElements.thumbRight) {
        let newRight = (this.innerRight - event.clientX) / this.innerWidth * 100
        if (newRight < 0) {
          newRight = 0
        }
        const rightFromLeftThumb = 100 - parseFloat(this.subElements.thumbLeft.style.left)
        if (newRight > rightFromLeftThumb) {
          newRight = rightFromLeftThumb
        }

        this.dragging.style.right = this.subElements.progress.style.right = newRight + '%'
        this.to = this.max - Math.floor(newRight * this.rangeValue / 100)
        this.subElements.to.innerHTML = this.formatValue ? this.formatValue(this.to) : this.to
      }
    }

    onPointerUp = event => {
      this.element.classList.remove('range-slider_dragging')

      document.removeEventListener("pointermove", this.onPointerMove)
      document.removeEventListener("pointerup", this.onPointerUp)

      this.element.dispatchEvent(new CustomEvent('range-select', {
        detail: { from: this.from, to: this.to},
        bubbles: true
      }))
    }

    updatePoints() {
      const left = Math.floor((this.from - this.min) / (this.rangeValue || 1) * 100) + '%'
      const right = Math.floor((this.max - this.to) / (this.rangeValue || 1) * 100) + '%'
      
      this.subElements.progress.style.left = this.subElements.thumbLeft.style.left = left
      this.subElements.progress.style.right = this.subElements.thumbRight.style.right = right
    }

    remove() {
      if (this.element) {
          this.element.remove()
      }
    }
  
    destroy() {
      this.remove()
      this.element = null
      this.subElements = {}
        
      document.removeEventListener("pointermove", this.onPointerMove)   
      document.removeEventListener("pointerup",  this.onPointerUp) 
    }
}