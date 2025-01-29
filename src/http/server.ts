import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createGoalRoute } from './routes/create-goal'
import { createCompletionRoute } from './routes/create-completions'
import { getPendingGoalsRoute } from './routes/get-pending-goals'
import { getWeekSummaryRoute } from './routes/get-week-summary'
import fastifyCors from '@fastify/cors'

// Server e utilizando Zod para validação.
const app = fastify().withTypeProvider<ZodTypeProvider>()

// Configuração CORS
app.register(fastifyCors, {
  origin: '*',
})

// Configura como o Fastify irá compilar as validações e a serialização.
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Rotas
app.register(createGoalRoute)
app.register(createCompletionRoute)
app.register(getPendingGoalsRoute)
app.register(getWeekSummaryRoute)

// Iniciando server.
app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running!')
  })
