import DoubleSlider from "../../../components/double-slider"
import SortableTable from "../../../components/sortable-table"

import header from "./product-list-header"

export default class Page {

  components = {}
  subElements = {}
  params = {}

  async render() {
    this.renderElement()
    this.renderSubelements()
    this.renderComponents()

    this.subElements.doubleSlider.append(this.components.doubleSlider.element)
    this.subElements.productsContainer.append(this.components.sortableTable.element)

    this.subElements.filterName.addEventListener("input", this.inputName)
    this.subElements.filterStatus.addEventListener("change", this.changeStatus)
    this.components.doubleSlider.element.addEventListener("range-select", this.changeRange)

    return this.element
  }

  renderElement() {
    this.element = document.createElement('div')
    this.element.className = 'products-list'
    this.element.innerHTML = this.elementInnerHtml
  }

  renderSubelements() {
    const elements = this.element.querySelectorAll('[data-element]')
   
    for (const subElement of elements) {
      this.subElements[subElement.dataset.element] = subElement
    }
  } 

  async renderComponents() {

    this.components.doubleSlider = new DoubleSlider({
      min: 0, 
      max: 4000, 
      formatValue: data => "$" + data
    })

    this.components.sortableTable = new SortableTable(
        header, {
          url: 'api/rest/products?_embed=subcategory.category'
        }
    )
}

inputName = event => {
  this.params.title_like = event.target.value
  this.updateSortableTable()
}

changeStatus = event => {
  this.params.status = event.target.value
  this.updateSortableTable()
}

changeRange = event => {
  this.params.price_gte = event.detail.from
  this.params.price_lte = event.detail.to
  this.updateSortableTable()
}

async updateSortableTable() {
  for (const [keyParam, valueParam] of Object.entries(this.params)) {
    //чтобы при прокрутке в запросе оставались текущие параметры
    this.components.sortableTable.url.searchParams.set(keyParam, valueParam)
  }
  
  const tableData = await this.components.sortableTable.loadData()
  this.components.sortableTable.update(tableData)
}

  get elementInnerHtml() {
    return `<div class="content__top-panel">
              <h1 class="page-title">Товары</h1>
              <a href="/products/add" class="button-primary">Добавить товар</a>
            </div>
            <div class="content-box content-box_small">
              <form class="form-inline">
                <div class="form-group">
                  <label class="form-label">Сортировать по:</label>
                  <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
                </div>
                <div class="form-group" data-element="sliderContainer">
                  <label class="form-label">Цена:</label>
                  <div class="range-slider" data-element="doubleSlider"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Статус:</label>
                  <select class="form-control" data-element="filterStatus">
                    <option value="" selected="">Любой</option>
                    <option value="1">Активный</option>
                    <option value="0">Неактивный</option>
                  </select>
                </div>
              </form>
            </div>
            <div data-element="productsContainer" class="products-list__container">
            </div>`
  }

  destroy() {
    this.remove()

    for (const component of Object.values(this.components)) {
        component.destroy()
    }
    
    this.element = null
    this.subElements = {}
    this.params = {}
  }

  remove() {
      if (this.element) {
        this.element.remove()
      }
  }
}
