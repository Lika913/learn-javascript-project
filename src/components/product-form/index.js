import SortableList from '../sortable-list/index.js'
import escapeHtml from '../../utils/escape-html.js'
import fetchJson from '../../utils/fetch-json.js'

const IMGUR_CLIENT_ID = '28aaa2e823b03b1'
const BACKEND_URL = 'https://course-js.javascript.ru'
const IMAGE_SERVICE_URL = 'https://api.imgur.com/3/image'

export default class ProductForm {

  constructor (productId) {
    this.productId = productId
    this.numberFields = ["discount", "price", "quantity", "status"]
    this.fields = [...this.numberFields, "title", "description", "subcategory"]
    this.data = {}
    this.subcategories = []
    this.subElements = {}
  }

  async render () {
    await this.loadData()

    this.renderElement()
    this.renderSubelements()
    this.fillValues()
    this.addImages()    

    this.element.addEventListener("submit", this.onSubmit)
    this.subElements.uploadImage.addEventListener("click", this.uploadImage)

    return this.element
  }

  renderElement() {
    this.element = document.createElement("div")
    this.element.className = "product-form"
    this.element.innerHTML = this.productFormInnerHTML    
  }

  renderSubelements() {
    const elements = this.element.querySelectorAll('[data-element]')
  
    for (const subElement of elements) {
      const name = subElement.dataset.element
      this.subElements[name] = subElement
    }
  }

  fillValues() {

    if (!this.productId) return

    for (const key of this.fields) {
      const item = this.subElements[key]

      if (item) {
        item.value = this.data[key]
      }
    }
  }

  collectValues() {
    const result = {}

    for (const key of this.fields) {
      const item = this.subElements[key]

      if (item) {
        result[key] = this.numberFields.includes(key) ? parseFloat(item.value) : item.value
      }
    }

    if (this.productId) {
      result["id"] = this.productId
    }

    return result
  }

  uploadImage = () => {
    const inputImage = document.createElement("input")
    inputImage.type = "file"
    inputImage.hidden = true
    inputImage.accept = 'image/*'
    
    document.body.append(inputImage)

    inputImage.addEventListener("change", async (event) => {

      const file = event.target.files[0]
      if (!file) return

      this.subElements.uploadImage.classList.add('is-loading')
      this.subElements.uploadImage.disabled = true

      const formData = new FormData()
      formData.append("image", file)
      
      const response = await fetchJson(IMAGE_SERVICE_URL, {
        method: "POST",
        headers: {
          "Authorization": `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData
      })

      this.subElements.uploadImage.classList.remove('is-loading');
      this.subElements.uploadImage.disabled = false

      const image = this.generateImage(file.name, response.data.link)
      this.subElements.imageListContainer.append(image)

      inputImage.remove()
    })

    inputImage.click()
  }

  async loadData() {

    const promises = []

    const urlSubcategory = new URL("/api/rest/categories?_sort=weight&_refs=subcategory", BACKEND_URL)
    const categoriesPromise = fetchJson(urlSubcategory)
    promises.push(categoriesPromise)

    if (this.productId) {

      const urlProduct = new URL("/api/rest/products", BACKEND_URL)
      urlProduct.searchParams.set("id", this.productId)

      const productPromise = fetchJson(urlProduct)
      promises.push(productPromise)
    }
    
    const [dataCategories, dataProduct] = await Promise.all(promises)
    this.parseCategories(dataCategories)
    this.parseProduct(dataProduct)
  }

  parseProduct(dataProduct) {

    if (dataProduct && dataProduct[0]) {
      const data = dataProduct[0]

      for (const key of this.fields) {
        this.data[key] = data[key]
      }
      
      this.data.images = data.images
    }
  }

  parseCategories(dataCategories) {
    for (const category of dataCategories) {
      for (const subcategory of category.subcategories) {
        this.subcategories.push({
          id: subcategory.id, 
          title: `${category.title} &gt; ${subcategory.title}`
        })
      }
    }    
  }

  onSubmit = event => {
    event.preventDefault()
    this.save()
  }

  async save() {

    const url = new URL("/api/rest/products", BACKEND_URL)
    const body = this.collectValues()
    
    const response = await fetch(url, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (response.ok) {
      const customEvent = this.productId ? new CustomEvent("product-updated", { detail: this.productId }) : new CustomEvent( "product-saved")
      this.element.dispatchEvent(customEvent)
    }
    else {
      console.log("error: " + await response.text())
    }
  }

  addImages() {
    if (this.data.images?.length) {
      const imageItems = this.data.images.map(img => this.generateImage(img.source, img.url))
      const sortableList = new SortableList({items: imageItems})

      this.subElements.imageListContainer.append(sortableList.element)
    }
  }

  generateImage(source, url) {

    const sourceValid = escapeHtml(source)
    const urlValid = escapeHtml(url)

    const image = document.createElement("li")
    image.className = "products-edit__imagelist-item sortable-list__item"
    image.innerHTML = `<span>
                        <img src="icon-grab.svg" data-grab-handle alt="grab">
                        <img class="sortable-table__cell-img" alt="${sourceValid}" src="${urlValid}">
                        <span>${sourceValid}</span>
                      </span>
                      <button type="button">
                        <img src="icon-trash.svg" data-delete-handle alt="delete">
                      </button>`
    return image
  }

  get categories() {
    return this.subcategories.map(category => `<option value="${category.id}">${category.title}</option>`).join("")
  }

  get productFormInnerHTML() {

    return `
        <form data-element="productForm" class="form-grid">

          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input data-element="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea data-element="description" required="" class="form-control" name="description" placeholder="Описание товара"></textarea>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Фото</label>
            <ul class="sortable-list" data-element="imageListContainer">
            </ul>
            <button data-element="uploadImage" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select data-element="subcategory" class="form-control" name="subcategory">
              ${this.categories}
            </select>
          </div>
          
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input data-element="price" required="" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" data-element="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input data-element="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select data-element="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? "Сохранить" : "Добавить"} товар
            </button>
          </div>
        </form>`
  }

  destroy() {
      this.remove()
      this.element = null
      this.subElements = {}
      this.data = {}
      this.subcategories = []
  }
  
  remove() {
      if (this.element) {
        this.element.remove()
      }
  }
}