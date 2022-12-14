const header = [
    {
        id: 'id',
        title: 'ID',
        sortable: true
    },
    {
        id: 'user',
        title: 'Client',
        sortable: true
    },
    {
        id: 'createdAt',
        title: 'Date',
        sortable: true,
        template: data => {
            data = new Date(data)
            return `<div class="sortable-table__cell">${data.getDate()} ${data.getShortMonthName()} ${data.getFullYear()} г.</div>`
        }
    },
    {
        id: 'totalCost',
        title: 'Price',
        sortable: true,
        template: data => `<div class="sortable-table__cell">$${data}</div>`
    },
    {
        id: 'delivery',
        title: 'Satus',
        sortable: true
    }
]

export default header