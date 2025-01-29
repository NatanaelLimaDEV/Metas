"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const create_goal_1 = require("./routes/create-goal");
const create_completions_1 = require("./routes/create-completions");
const get_pending_goals_1 = require("./routes/get-pending-goals");
const get_week_summary_1 = require("./routes/get-week-summary");
const cors_1 = __importDefault(require("@fastify/cors"));
// Server e utilizando Zod para validação.
const app = (0, fastify_1.default)().withTypeProvider();
// Configuração CORS
app.register(cors_1.default, {
    origin: '*',
});
// Configura como o Fastify irá compilar as validações e a serialização.
app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
// Rotas
app.register(create_goal_1.createGoalRoute);
app.register(create_completions_1.createCompletionRoute);
app.register(get_pending_goals_1.getPendingGoalsRoute);
app.register(get_week_summary_1.getWeekSummaryRoute);
// Iniciando server.
app
    .listen({
    port: 3333,
})
    .then(() => {
    console.log('HTTP server running!');
});
