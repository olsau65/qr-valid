import * as mongoose from 'mongoose'

mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
})
mongoose.set('useCreateIndex', true)

export * from './User'
