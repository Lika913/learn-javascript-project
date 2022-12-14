import DoubleSlider from "../../../components/double-slider"
import SortableTable from "../../../components/sortable-table"

import header from "./product-list-header"

export default class Page {

  components = {}
  subElements = {}

  async render() {
    this.renderElement()
    this.renderSubelements()
    this.renderComponents()

    this.subElements.doubleSlider.append(this.components.doubleSlider.element)
    this.subElements.productsContainer.append(this.components.sortableTable.element)

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
    //await this.updateSortableTable(from, to)

}

  get elementInnerHtml() {
    return `<div class="content__top-panel">
              <h1 class="page-title">Товары</h1>
              <a href="/products/add" data-element="buttonAdd" class="button-primary">Добавить товар</a>
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
}
