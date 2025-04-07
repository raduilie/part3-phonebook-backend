const mongoose = require('mongoose')

let operation = 'list'
if (process.argv.length !== 3 && process.argv.length !== 5) {
  console.log('Give password as argument for listing or password, name and phone number for adding.')
  process.exit(1)
} else if (process.argv.length === 5) {
  operation = 'add'
}

const password = process.argv[2]

const url = `mongodb+srv://raduilie:${password}@cluster0.txv9jw1.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (operation === 'list') {
  console.log('phonebook:')
  Person.find({}).then(persons => {
    persons.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })
  person.save().then(result => {
    console.log(`Person saved to the database: ${result}`)
    mongoose.connection.close()
  })
}