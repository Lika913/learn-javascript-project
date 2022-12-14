let shownNotification

export default class NotificationMessage {

    constructor(message = '', {duration = 0, type = ''} = {}) {
        this.message = message
        this.duration = this.durationIsValid(duration) ? duration : 20
        this.type = this.typeIsValid(type) ? type : ''

        this.render()
    }

    render() {
        const wrapper = document.createElement("div")
        wrapper.innerHTML = this.innerHTML
        this.element = wrapper.firstElementChild
    }

    show(parent = document.body) {
        if (shownNotification) {
            shownNotification.remove()
        }

        parent.append(this.element)
        shownNotification = this.element
        this.timerId = setTimeout(() => this.remove(), this.duration)
    }

    get innerHTML() {
        return `<div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
                    <div class="timer"></div>
                    <div class="inner-wrapper">
                    <div class="notification-header">${this.type}</div>
                    <div class="notification-body">
                        ${this.message}
                    </div>
                    </div>
                </div>`
    }  

    durationIsValid(duration) {
        return typeof duration === "number" &&
               duration > 0
    }
    
    typeIsValid(type) {
        return ["success", "error"].includes(type)
    }

    destroy() {
        this.remove()
        this.element = null        
    }

    remove() {
        clearTimeout(this.timerId)
        
        if (shownNotification == this.element) {
            shownNotification = null
            this.element.remove()
        }
    }
}