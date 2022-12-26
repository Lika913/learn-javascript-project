import fetchJson from "../../utils/fetch-json.js"

const BACKEND_URL = 'https://course-js.javascript.ru'

export default class SortableTable {

  DESC = "desc"
  ASC = "asc"
  
  step = 20
  start = 1
  data = []
  subElements = {}

  constructor(headersConfig, {
    url = '',
    sorted = {},
    isSortLocally = false
  } = {}) {

    this.headersConfig = headersConfig
    this.url = new URL(url, BACKEND_URL)
    this.isSortLocally = isSortLocally
    this.sorted = {
      id: sorted?.id || headersConfig.find(item => item.sortable).id,
      order: sorted?.order || this.ASC
    }

    this.render()
  }

  async render() {

    this.renderElement()
    this.renderSubElements()

    const data = await this.loadData()
    this.update(data)

    this.subElements.header.addEventListener("pointerdown", this.onClickHeader)
    window.addEventListener('scroll', this.onScroll)
  }

  renderElement() {
    this.element = document.createElement("div")
    this.element.className = "products-list__container"
    this.element.innerHTML = this.elementInnerHtml
  }
  
  renderSubElements() {
    const subElements = this.element.querySelectorAll('[data-element]')

    for (const subElement of subElements) {
      this.subElements[subElement.dataset.element] = subElement
    }     
  }

  update(data) {
    this.start = 1
    this.data = data

    if (data?.length) {
      this.element.classList.remove('sortable-table_empty')

      if (this.isSortLocally) {
        this.sortOnClient()
      }
      
      this.subElements.body.innerHTML = this.getBodyRows()
      this.displayArrow()
    }
    else {
      this.element.classList.add('sortable-table_empty')
    }    
  }

  async loadData(id = this.sorted.id, order = this.sorted.order) {

    this.element.append(this.subElements.loading)

    this.url.searchParams.set('_sort', id)
    this.url.searchParams.set('_order', order)
    this.url.searchParams.set('_start', this.start)
    this.url.searchParams.set('_end', this.start + this.step)

    const data = await fetchJson(this.url)

    this.subElements.loading.remove()
    
    return data
  }

  onScroll = async (event) => {
    const tableBottom = document.documentElement.getBoundingClientRect().bottom
    const height = document.documentElement.clientHeight + 100
    
    if (tableBottom < height && !this.alreadyLoading && !this.isSortLocally) {
      
      this.alreadyLoading = true

      this.start += this.step
      const data = await this.loadData()

      this.data.push(...data)
      this.appendRows(data)

      this.alreadyLoading = false
    }
  }

  appendRows(newData) {
    const wrapper = document.createElement("div")
    wrapper.innerHTML = this.getBodyRows(newData)

    this.subElements.body.append(...wrapper.childNodes)
  }

  onClickHeader = async event => {
    const cell = event.target.closest('[data-sortable="true"]')

    if (cell && this.element.contains(cell)) {
    
      if (this.sorted.id === cell.dataset.id) {
        this.sorted.order = this.inversionSortType
      } else {
        this.sorted.id = cell.dataset.id
        this.sorted.order = this.DESC
      }
      
      if (this.isSortLocally) {
        this.sortOnClient()
      }
      else {
        await this.sortOnServer()        
      }

      this.subElements.body.innerHTML = this.getBodyRows()
      this.displayArrow()
    }
  }

  sortOnClient() {
    const sortRule = this.getSortRule(this.sorted.id, this.sorted.order)
    this.data.sort(sortRule)
  }

  async sortOnServer() {
    this.start = 1
    this.data = await this.loadData()
  }

  get inversionSortType() {
    if (this.sorted.order === this.DESC) return this.ASC
    if (this.sorted.order === this.ASC) return this.DESC
  }

  displayArrow() {
    const headers = this.element.querySelectorAll('.sortable-table__cell[data-id][data-sortable="true"]')

    for (const headerItem of headers) {
      if (headerItem.dataset.id === this.sorted.id) {
        headerItem.dataset.order = this.sorted.order
      } else {
        headerItem.dataset.order = ""
      }
    }
  }

  getSortRule(fieldValue, orderValue) {
    const headerItem = this.headersConfig.find(x => x.id === fieldValue) 
    const sortType = this.getSortType(orderValue)

    if (headerItem.sortType === "string") {
      return (a, b) => sortType * a[fieldValue].localeCompare(b[fieldValue], ["ru", "eng"], {caseFirst: "upper"})
    }
    if (headerItem.sortType === "number") {
      return (a, b) => sortType * (a[fieldValue] - b[fieldValue])
    }
    if (headerItem.sortType === "custom") {
      return (a, b) => sortType * headerItem.customSorting(a, b)
    }
  }

  getSortType = (param) => {
    switch (param) {
        case this.ASC:
            return 1
        case this.DESC:
            return -1
        default:
            throw "Передан некорректный тип сортировки!"
    }
  }

  get elementInnerHtml() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
              ${this.headersConfig.map(x => this.getHeaderCell(x)).join("")}
            </div>
            <div data-element="body" class="sortable-table__body"></div>
            <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
            <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
              No products
            </div>`
  }
 
  getBodyRows(data = this.data) {
    return data.map(x => 
          `<a href="/products/${x.id}" class="sortable-table__row">
              ${this.getRowCells(x).join("")}
           </a>`).join("")
  }

  getRowCells(item) {    
    return this.headersConfig.map(headerItem => headerItem.template ? 
                    headerItem.template(item[headerItem.id]) :
                   `<div class="sortable-table__cell">${item[headerItem.id]}</div>`)
  }

  getHeaderCell(item) {
    return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
              <span>${item.title}</span>
              ${item.sortable ? `<span data-element="arrow" class="sortable-table__sort-arrow">
                                  <span class="sort-arrow"></span>
                                </span>` : ``}
            </div>`
  }

  destroy() {
    this.remove()
    this.element = null    
    this.subElements = {} 
  }

  remove() {
    if (this.element) {
      this.element.remove()
    }

    window.removeEventListener('scroll', this.onScroll)
  }
}