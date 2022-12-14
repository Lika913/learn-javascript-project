import Router from './router/index.js'
import Tooltip from './components/tooltip/index.js'

Date.prototype.addDays = function (countDays) {
  return this.setDate(this.getDate() + countDays)
}

Date.prototype.addMonth = function (countMonth) {
  return this.setMonth(this.getMonth() + countMonth)
}

Date.prototype.getFullMonthName = function () {
  return this.toLocaleString('en', { month: 'long' })
}

Date.prototype.getShortMonthName = function () {
  return this.toLocaleString('ru', { month: 'short' })
}

const tooltip = new Tooltip()
tooltip.initialize();

const router = Router.instance();

router
  .addRoute(/^$/, "dashboard")
  .addRoute(/^products$/, 'products/list')
  .addRoute(/^products\/add$/, 'products/edit')
  .addRoute(/^products\/([\w()-]+)$/, 'products/edit')
  .addRoute(/^sales$/, 'sales')
  .addRoute(/^categories$/, 'categories')
  .addRoute(/^404\/?$/, 'error404')
  .setNotFoundPagePath('error404')
  .listen();