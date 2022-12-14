import SortableList from "../../components/sortable-list"
import fetchJson from '../../utils/fetch-json.js'
 
const BACKEND_URL = 'https://course-js.javascript.ru'

 export default class Categories {

    async render() {
        await this.loadCategories()
        this.renderElement()

        return this.element
    }

    async loadCategories() {
        const url = new URL("/api/rest/categories?_sort=weight&_refs=subcategory", BACKEND_URL)
        this.categories = await fetchJson(url)
    }

    renderElement() {
        this.element = document.createElement("div")
        this.element.className = "categories"
        this.element.innerHTML = this.elementInnerHtml

        this.element.querySelector('[data-element="categoriesContainer"]').append(...this.categoriesElements)
    }

    get elementInnerHtml() {
        return `<div class="content__top-panel">
                    <h1 class="page-title">Категории товаров</h1>
                </div>
                <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
                <div data-element="categoriesContainer"></div>`
    }

    get categoriesElements() {
        return this.categories.map(category => {
            const element = document.createElement("div")
            element.className = "category category_open"
            element.innerHTML = `<header class="category__header">${category.title}</header>
                                 <div class="category__body">
                                    <div class="subcategory-list">
                                    </div>
                                 </div>`

            const subcategories = this.generateSubcategories(category.subcategories)
            element.querySelector(".subcategory-list").append(subcategories)
            element.querySelector(".category__header").addEventListener("click", event => {
                const category = event.target.closest(".category")
                if (category) {
                    category.classList.toggle("category_open")
                }
            })

            return element
        })
    }

    generateSubcategories(subcategories) {
        const items = subcategories.map(subcategory => {
            const element = document.createElement('li')
            element.dataset.grabHandle = ""
            element.className = "categories__sortable-list-item"            
            element.innerHTML = `<strong>${subcategory.title}</strong>
                                 <span><b>${subcategory.count}</b> products</span>`
            
            return element
        })

        const sortableList = new SortableList({ items })
        return sortableList.element
    }

    destroy() {
        this.remove()
        this.element = null
    }
    
    remove() {
        if (this.element) {
          this.element.remove()
        }
    }
 }