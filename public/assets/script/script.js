const Modal = {
    open() {
        document.querySelector('.modal-overlay').classList.remove('hidden')
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active')
        document.querySelector('.modal-overlay').classList.add('hidden')
    }
}

const Storage = {
    get() {
        try {
            return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
        } catch (error) {
            return []
        }
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },
    incomes() {
        let income = 0;
        Transaction.all.forEach(function (transaction) {
            income += transaction.amount > 0 ? transaction.amount : 0
        })
        return income;
    },
    expenses() {
        let expense = 0;
        Transaction.all.forEach(function (transaction) {
            expense += transaction.amount < 0 ? transaction.amount : 0
        })
        return expense;
    },
    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/imgs/minus.svg" alt="Remover transação">
            </td>
        `
        return html
    },
   
    updateBalance() {
        Utils.animationDisplay('incomeDisplay', 0, 180)
        Utils.animationDisplay('expenseDisplay', 0, 180)
        Utils.animationDisplay('totalDisplay', 0, 180)

        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())

        Utils.animationDisplay('incomeDisplay', 180, 360)
        Utils.animationDisplay('expenseDisplay', 180, 360)
        Utils.animationDisplay('totalDisplay', 180, 360)
    },
    clearTransaction() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '')
        value = Number(value) / 100
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: "BRL"
        })

        return signal + value
    },
    formatAmount(value) {
        value = Number(value) * 100
        return Math.round(value)
    },
    formatDate(value) {
        const splittedDate = value.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    animationDisplay(id, to, from){
        const transform = [
            { transform: `rotateX(${to}deg)` },
            { transform: `rotateX(${from}deg)` }
        ]
        const duration = {
            duration: 500,
        }
        document.getElementById(id).animate(transform, duration)
    },
}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    validateField() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim === "")
            throw new Error("Por favor, preencha todos os campos")
    },
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ''
        Form.date.value = ""
    },
    submit(event) {
        event.preventDefault()
        try {
            Form.validateField()
            const transaction = Form.formatValues()
            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.close()
            App.reload()
        } catch (error) {
            alert(error.message)
        }


    }
}

const App = {
    init() {
        Transaction.all.forEach(function (transaction, index) {
            DOM.addTransaction(transaction, index)
        })
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransaction()
        App.init()
    }
}

App.init()

