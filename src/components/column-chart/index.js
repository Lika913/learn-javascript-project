import fetchJson from '../../utils/fetch-json.js'

const BACKEND_URL = 'https://course-js.javascript.ru'

export default class ColumnChart {

    chartHeight = 50
    subElements = {}
    data = []

    constructor({
        label = '', 
        link = '', 
        formatHeading, 
        url = "",
        range = {}} 
        = {}) {
            
        this.label = label
        this.link = link
        this.url = new URL(url, BACKEND_URL)
        this.dateFrom = range?.from
        this.dateTo = range?.to
        this.formatHeading = formatHeading

        this.render()
    }

    render() {
        this.element = document.createElement("div")
        this.element.className = "column-chart column-chart_loading"
        this.element.style = `--chart-height: ${this.chartHeight}`
        this.element.innerHTML = this.elementInnerHtml

        const subElements = this.element.querySelectorAll('[data-element]')      
        for (const subElement of subElements) {
            this.subElements[subElement.dataset.element] = subElement
        }

        this.update()
    }

    async update(from = this.dateFrom, to = this.dateTo) {

        this.element.classList.add('column-chart_loading')

        this.url.searchParams.set('from', from)
        this.url.searchParams.set('to', to)

        this.data = await fetchJson(this.url) || []

        this.subElements.body.innerHTML = this.innerHtmlBody
        this.subElements.header.innerHTML = this.innerHtmlHeader

        this.element.classList.remove('column-chart_loading')
    }

    get elementInnerHtml() {
        return `<div class="column-chart__title">
                    Total ${this.label}
                    ${this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : ''}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">
                        ${this.innerHtmlHeader}
                    </div>
                    <div data-element="body" class="column-chart__chart">
                        ${this.innerHtmlBody}
                    </div>
                 </div>`
    }

    get innerHtmlHeader() {
        const valuesData = Object.values(this.data)
        if (!valuesData.length) return ''

        const sum = valuesData.reduce((x, y) => (x + y), 0)
        return this.formatHeading ? this.formatHeading(sum) : sum
    }

    get innerHtmlBody() {
        const valuesData = Object.values(this.data)
        if (!valuesData.length) return ''

        const maxValue = Math.max(...valuesData)
        return valuesData.map(item => {
            const columnProps = this.getColumnProps(item, maxValue)
            return `<div style="--value: ${columnProps.value}" data-tooltip="${columnProps.percent}"></div>`
        }).join("")
    }

    getColumnProps(item, maxValue) {
        const scale = this.chartHeight / maxValue
      
        return {
            percent: (item / maxValue * 100).toFixed(0) + '%',
            value: String(Math.floor(item * scale))
        }
    }

    remove() {
        if (this.element) {
            this.element.remove()
        }
    }

    destroy() {
        this.remove()
        this.subElements = {}
        this.element = null
        this.data = []
    }
}