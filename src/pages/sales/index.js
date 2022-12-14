import RangePicker from '../../components/range-picker/index.js'
import SortableTable from '../../components/sortable-table/index.js'

import fetchJson from "../../utils/fetch-json.js"

import header from "./sales-header"

export default class Sales {

    subElements = {}
    components = []

    async render() {
        this.renderElement()
        this.renderSubelements()
        this.renderComponents()

        this.subElements.rangePicker.append(this.components.rangePicker.element)
        this.subElements.sortableTable.append(this.components.sortableTable.element)

        this.components.rangePicker.element.addEventListener("date-select", this.updateComponents)

        return this.element        
    }

    renderElement() {
        this.element = document.createElement("div")
        this.element.className = "sales full-height flex-column"
        this.element.innerHTML = this.innerHtml
    }

    renderSubelements() {
        const elements = this.element.querySelectorAll('[data-element]')
       
        for (const subElement of elements) {
          const name = subElement.dataset.element
          this.subElements[name] = subElement
        }
    }

    renderComponents() {
        this.components.rangePicker = new RangePicker()

        this.components.sortableTable = new SortableTable(header, { url: 'api/rest/orders' })
        this.updateSortableTable(
            this.components.rangePicker.from,
            this.components.rangePicker.to
        )
    }

    updateComponents = async event => {
        ({from: this.from, to: this.to} = event.detail)
        
        this.updateSortableTable(this.from, this.to)
    }

    async updateSortableTable (from, to) {
        const url = new URL(this.components.sortableTable.url)

        url.searchParams.set('_start', '1')
        url.searchParams.set('_end', '21')
        url.searchParams.set('_sort', 'title')
        url.searchParams.set('_order', 'asc')
        url.searchParams.set('createdAt_gte', from.toISOString())
        url.searchParams.set('createdAt_lte', to.toISOString())

        const tableData = await fetchJson(url)
        this.components.sortableTable.update(tableData)     
    }

    get innerHtml() {
        return `<div class="content__top-panel">
                    <h1 class="page-title">Sales</h1>
                    <div data-element="rangePicker" class="rangepicker"></div>
                </div>
                <div data-element="sortableTable"></div>`
    }

    destroy() {
        this.remove()

        for (const component of Object.values(this.components)) {
            component.destroy()
        }
        
        this.element = null
        this.subElements = {}
        this.components = {}
    }
    
    remove() {
        if (this.element) {
          this.element.remove()
        }
    }
}