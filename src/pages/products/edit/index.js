import ProductForm from '../../../components/product-form' 

export default class Page {

    components = {}
    subElements = {}

    async render() {
        this.renderElement()
        this.renderComponent()

        return this.element
    }

    renderElement() {
        this.element = document.createElement('div')
        this.element.className = 'products-edit'
        this.element.innerHTML = this.elementInnerHtml
    }

    async renderComponent() {
        const id = location.pathname
                    .replace("/products/", "")
                    .replace(/^add$/, "")
        const component = new ProductForm(id)

        this.element.querySelector('.content-box').append(await component.render())
    }

    get elementInnerHtml() {
        return `<div class="content__top-panel">
                    <h1 class="page-title">
                        <a href="/products" class="link">Товары</a> / Редактировать
                    </h1>
                </div>
                <div class="content-box"></div>`
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
