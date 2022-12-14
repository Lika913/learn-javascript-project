import RangePicker from '../../components/range-picker/index.js'
import SortableTable from '../../components/sortable-table/index.js'
import ColumnChart from '../../components/column-chart/index.js'

import header from './bestsellers-header.js'

import fetchJson from "../../utils/fetch-json.js"

export default class Page {

    components = {}
    subElements = {}

    async render() {
        this.renderElement()
        this.renderSubelements()
        await this.renderComponents()

        this.subElements.rangePicker.append(this.components.rangePicker.element)
        this.subElements.sortableTable.append(this.components.sortableTable.element)
        this.subElements.ordersChart.append(this.components.ordersChart.element)
        this.subElements.salesChart.append(this.components.salesChart.element)
        this.subElements.customersChart.append(this.components.customersChart.element)

        this.components.rangePicker.element.addEventListener("date-select", this.updateComponents)

        return this.element
    }

    async updateSortableTable (from, to) {
        const url = new URL(this.components.sortableTable.url)

        url.searchParams.set('_start', '1')
        url.searchParams.set('_end', '21')
        url.searchParams.set('_sort', 'title')
        url.searchParams.set('_order', 'asc')
        url.searchParams.set('from', from.toISOString())
        url.searchParams.set('to', to.toISOString())
    
        const tableData = await fetchJson(url)
        this.components.sortableTable.update(tableData)
    }

    updateComponents = async event => {
        
        ({from: this.from, to: this.to} = event.detail)

        this.components.ordersChart.update(this.from, this.to)
        this.components.salesChart.update(this.from, this.to)
        this.components.customersChart.update(this.from, this.to)

        this.updateSortableTable(this.from, this.to)
    }

    renderElement() {
        this.element = document.createElement("div")
        this.element.className = "dashboard"
        this.element.innerHTML = this.innerHTML
    }

    renderSubelements() {
        const elements = this.element.querySelectorAll('[data-element]')
       
        for (const subElement of elements) {
          this.subElements[subElement.dataset.element] = subElement
        }
    }

    async renderComponents() {
        const now = new Date()
        const to = this.to = new Date(now)
        const from = this.from = new Date(now.addMonth(-1))

        //render rangePicker
        this.components.rangePicker = new RangePicker({from, to})

        //render sortableTable
        this.components.sortableTable = new SortableTable(
            header, {
                url: 'api/dashboard/bestsellers', 
                isSortLocally: true
            }
        )
        await this.updateSortableTable(from, to)

        //render columnCharts
        this.components.ordersChart = new ColumnChart({
            label: "orders", 
            link: "#", 
            url: "api/dashboard/orders", 
            range: {from, to}
        })
        this.components.salesChart = new ColumnChart({
            label: "sales", 
            url: "api/dashboard/sales", 
            range: {from, to},
            formatHeading: data => "$" + data
        }) 
        this.components.customersChart = new ColumnChart({
            label: "customers", 
            url: "api/dashboard/customers", 
            range: {from, to}
        }) 
    }

    get innerHTML() {
        return `<div class="content__top-panel">
                    <h2 class="page-title">Dashboard</h2>
                    <div data-element="rangePicker"></div>
                </div>
                <div data-element="chartsRoot" class="dashboard__charts">
                    <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                    <div data-element="salesChart" class="dashboard__chart_sales"></div>
                    <div data-element="customersChart" class="dashboard__chart_customers"></div>
                </div>

                <h3 class="block-title">Best sellers</h3>

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