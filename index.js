require('dotenv').config()
const express = require('express')
const Person = require('./models/person')

const app = express()

const cors = require('cors')
const morgan = require('morgan')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
morgan.token('person', (req, res) => { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

const generateId = () => {
    return Math.floor(Math.random() * 1000000)
}

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body
    const newPerson = {name, number}
    Person.findByIdAndUpdate(request.params.id, newPerson, {runValidators: true})
        .then(person => {
            if (person) {
                newPerson.id = request.params.id
                response.json(newPerson)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(person => {
            if (!person) {
                console.warn(`Person with id ${request.params.id} does not exist.`)
            }
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.get('/info', (request, response) => {
    const date = new Date(Date.now())
    Person.find({}).then(persons => {
        response.send(`<div>Phonebook has info for ${persons.length} people</div><div>${date.toString()}</div>`).end()
    })    
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
