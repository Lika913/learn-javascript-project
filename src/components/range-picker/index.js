export default class RangePicker {

  constructor({from, to} = {}) {

      if (!from || !to || from > to) {
          const now = new Date()
          this.to = new Date(now)
          this.from = new Date(now.addMonth(-1))
      } else {
          this.from = from
          this.to = to
      }

      this.selectedDates = []
      this.daysOfMonths = {}
      this.subElements = {}

      this.render()
  }

  render() {
      this.renderElement()
      this.renderSubElements()

      this.subElements.input.addEventListener("click", this.onClickInput)        
  }

  renderElement() {
      this.element = document.createElement("div")
      this.element.className = "rangepicker"
      this.element.innerHTML = this.rangepickerInnerHTML
  }

  renderSubElements(element = this.element) {
      const elements = element.querySelectorAll('[data-element]')

      for (const subElement of elements) {
          const name = subElement.dataset.element
          this.subElements[name] = subElement
      }
  }

  renderSelector() {
      this.subElements.selector.innerHTML = this.selectorInnerHTML
      this.renderSubElements(this.subElements.selector)
      this.subElements.selector.addEventListener("click", this.onClickGrid)
      this.subElements.leftArrow.addEventListener("click", this.onClickLeftArrow)
      this.subElements.rightArrow.addEventListener("click", this.onClickRightArrow)

      document.addEventListener("click", this.onClickDocument)
  }

  onClickLeftArrow = event => {
      const firstDay = new Date(this.subElements.gridLeft.dataset.firstDay)            

      this.subElements.gridRight.innerHTML = this.subElements.gridLeft.innerHTML
      this.subElements.gridRight.dataset.firstDay = firstDay
      this.subElements.monthRight.innerHTML = firstDay.getFullMonthName()

      firstDay.addMonth(-1)

      this.subElements.gridLeft.innerHTML = this.generateMonth(firstDay)
      this.subElements.gridLeft.dataset.firstDay = firstDay
      this.subElements.monthLeft.innerHTML = firstDay.getFullMonthName()
  }

  onClickRightArrow = event => {
      const firstDay = new Date(this.subElements.gridRight.dataset.firstDay)            

      this.subElements.gridLeft.innerHTML = this.subElements.gridRight.innerHTML
      this.subElements.gridLeft.dataset.firstDay = firstDay
      this.subElements.monthLeft.innerHTML = firstDay.getFullMonthName()

      firstDay.addMonth(1)

      this.subElements.gridRight.innerHTML = this.generateMonth(firstDay)
      this.subElements.gridRight.dataset.firstDay = firstDay
      this.subElements.monthRight.innerHTML = firstDay.getFullMonthName()
  }

  onClickDocument = event => {
      if (this.element.classList.contains('rangepicker_open') &&
         !this.element.contains(event.target)) {
          
          this.close()
      }
  }

  onClickInput = event => {

      if (!this.subElements.selector.innerHTML) {
          this.renderSelector()
      }
      
      this.element.classList.toggle("rangepicker_open")
  }

  onClickGrid = event => {
      
      const cell = event.target.closest('.rangepicker__cell[data-value]')

      if (cell) {
          this.selectedDates.push(new Date(cell.dataset.value))

          if (this.selectedDates.length === 1) {
              const classes = ["rangepicker__selected-from", "rangepicker__selected-between", "rangepicker__selected-to"]
              const selectedCells = this.subElements.selector.querySelectorAll(classes.map(x => "." + x).join())
              for (const item of selectedCells) {
                  item.classList.remove(...classes)
              }
          }

          if (this.selectedDates.length === 2) {

              this.selectedDates.sort((a, b) => a.getTime() - b.getTime())

              this.from = this.selectedDates[0]
              this.to = this.selectedDates[1]

              this.subElements.from.innerHTML = this.from.toLocaleDateString()
              this.subElements.to.innerHTML = this.to.toLocaleDateString()
              
              this.close()
              this.callEvent()
          }
      }
  }

  callEvent() {
    const customEvent = new CustomEvent("date-select", { 
        bubbles: true, 
        detail: {
            from: this.from, 
            to: this.to
        }
    })
    this.element.dispatchEvent(customEvent)
  }

  paintCells() {
      const cells = this.subElements.selector.querySelectorAll(".rangepicker__cell")
      for (const item of cells) {
          item.className = this.generateClassNameForCell(new Date(item.dataset.value))
      }
  }

  close() {
      this.element.classList.remove("rangepicker_open")
      this.selectedDates = []
      this.paintCells()
  }

  get rangepickerInnerHTML() {

      return `<div class="rangepicker__input" data-element="input">
                  <span data-element="from">${this.from.toLocaleDateString()}</span> -
                  <span data-element="to">${this.to.toLocaleDateString()}</span>
              </div>
              <div class="rangepicker__selector" data-element="selector"></div>`
  }

  get selectorInnerHTML() {        

      return `<div class="rangepicker__selector-arrow"></div>
              <div class="rangepicker__selector-control-left" data-element="leftArrow"></div>
              <div class="rangepicker__selector-control-right" data-element="rightArrow"></div>
              ${this.generateCalendar(this.from, "Left")}           
              ${this.generateCalendar(this.to, "Right")}`
  }

  generateCalendar(date, identifier) {
      const month = date.getFullMonthName()
      const firstDayInMonth = new Date(date.getFullYear(), date.getMonth(), 1)

      return `<div class="rangepicker__calendar">
                  <div class="rangepicker__month-indicator">
                      <time data-element="${"month" + identifier}" datetime="${month}">${month}</time>
                  </div>
                  <div class="rangepicker__day-of-week">
                      <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                  </div>
                  <div class="rangepicker__date-grid" 
                       data-element="${"grid" + identifier}" 
                       data-first-day ="${firstDayInMonth}">
                          ${this.generateMonth(firstDayInMonth)}
                  </div>
              </div>`
  }

  generateMonth(firstDayInMonth) {

      const key = `${firstDayInMonth.getMonth()}_${firstDayInMonth.getFullYear()}`

      if (!this.daysOfMonths[key]) {

          let days = ""
          const day = new Date(firstDayInMonth)
          const lastDay = new Date(firstDayInMonth.getFullYear(), firstDayInMonth.getMonth() + 1, 0)

          while (day.getTime() <= lastDay.getTime()) {

               days += `<button 
                          type="button" 
                          class="${this.generateClassNameForCell(day)}" 
                          data-value="${day}"
                          ${day.getDate() === 1 ? `style="--start-from: ${firstDayInMonth.getDay()}"` : ''}
                       >
                          ${day.getDate()}
                       </button>`

              day.addDays(1)
          }

          this.daysOfMonths[key] = days
      }

      return this.daysOfMonths[key]
  }

  generateClassNameForCell(date) {
      let className ="rangepicker__cell"

      if (date.getTime() === this.from.getTime()) {
          className += " rangepicker__selected-from"
      }
      if (date.getTime() > this.from.getTime() && date.getTime() < this.to.getTime()) {
          className += " rangepicker__selected-between"
      }
      if (date.getTime() === this.to.getTime()) {
          className += " rangepicker__selected-to"
      }

      return className
  }

  destroy() {
      this.remove()
      this.element = null    
      this.subElements = {} 
      this.daysOfMonths = {}
      this.selectedDates = []
  }
  
  remove() {
      if (this.element) {
        this.element.remove()
        document.removeEventListener("click", this.onClickDocument)
      }
  }
}
