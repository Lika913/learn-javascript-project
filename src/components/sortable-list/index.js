export default class SortableList {

  ABOVE = "above"
  BELOW = "below"

  scrollStep = 25
  distanceFromBorder = 40

  constructor({items = []} = {}) {
      
      this.items = items
      
      this.stylizeItems()
      this.render()
  }

  stylizeItems() {
      this.items.forEach(item => {
          item.classList.add("sortable-list__item")
          item.style.zIndex = 999
      })
  }

  render() {
      this.dropTarget = document.createElement("div")
      this.dropTarget.className = "sortable-list__placeholder"

      this.element = document.createElement("div")
      this.element.className = 'sortable-list'
      this.element.append(...this.items)
      this.element.addEventListener("pointerdown", this.onPointerDown)
  }

  onPointerDown = event => {
      event.preventDefault()
      
      const grabHandle = event.target.closest("[data-grab-handle]")
      
      if (grabHandle) {
            
          const item = grabHandle.closest(".sortable-list__item")
          if (!item) return

          const { left, top } = item.getBoundingClientRect()

          item.style.width = this.dropTarget.style.width = item.offsetWidth + "px"
          item.style.height =  this.dropTarget.style.height = item.offsetHeight + "px"
          item.style.zIndex = 1000
          item.classList.add('sortable-list__item_dragging')

          item.after(this.dropTarget)
          
          this.shiftX = event.clientX - left
          this.shiftY = event.clientY - top
          this.dragging = item

          this.setDragPoints(event.clientX - this.shiftX, event.clientY - this.shiftY)
          
          document.addEventListener("pointermove", this.onPointerMove)
          document.addEventListener("pointerup", this.onPointerUp)
      }

      const deleteHandle = event.target.closest("[data-delete-handle]")
      if (deleteHandle) {

          const item = deleteHandle.closest(".sortable-list__item")
          if (!item) return

          item.remove()
      }        
  }

  onPointerMove = event => {
      event.preventDefault()
      
      this.setDragPoints(event.clientX - this.shiftX, event.clientY - this.shiftY)
      
      this.dragging.style.visibility = "hidden"         
      const itemUnderDrag = document
          .elementFromPoint(event.clientX, event.clientY)
          .closest('.sortable-list__item:not(.sortable-list__item_dragging)')
      this.dragging.style.visibility = "visible" 
                      
      if (itemUnderDrag && this.element.contains(itemUnderDrag)) {

          const { top } = itemUnderDrag.getBoundingClientRect()
          const middleElem =  top + (itemUnderDrag.offsetHeight / 2)

          let insertionPlace = event.clientY > middleElem ? this.BELOW : this.ABOVE

          if (this.currentItemUnderDrag !== itemUnderDrag || 
              this.currentInsertionPlace != insertionPlace) {

              this.insertDropTarget(itemUnderDrag, insertionPlace)
              
              this.currentItemUnderDrag = itemUnderDrag
              this.currentInsertionPlace = insertionPlace
          }
      }

      this.scrollWhenMoving(event.clientY)  
  }

  onPointerUp = event => {
      event.preventDefault()

      this.dragging.classList.remove('sortable-list__item_dragging')
      this.dragging.style.zIndex = 999
      this.setDragPoints(0, 0)
      
      this.dropTarget.replaceWith(this.dragging)

      this.dragging = this.shiftX = this.shiftY = null

      document.removeEventListener("pointermove", this.onPointerMove)
      document.removeEventListener("pointerup", this.onPointerUp)
  }

  insertDropTarget(item, insertionPlace) {
      if (insertionPlace === this.BELOW) {
          item.after(this.dropTarget)
      }
      if (insertionPlace === this.ABOVE) {
          item.before(this.dropTarget)
      }
  }

  setDragPoints(left, top) {
      this.dragging.style.left = left + "px"
      this.dragging.style.top = top + "px"
  }

  scrollWhenMoving(clientY) {

      if (clientY > document.documentElement.clientHeight - this.distanceFromBorder) {
          window.scrollBy({top: this.scrollStep})
      }
      if (clientY < this.distanceFromBorder) {
          window.scrollBy({top: -this.scrollStep})
      }
  }

  destroy() {
      this.remove()
      this.element = this.dropTarget = this.dragging = this.shiftX = this.shiftY = null
      this.items = []
  }
  
  remove() {
      if (this.element) {
        this.element.remove()
      }
  }
}