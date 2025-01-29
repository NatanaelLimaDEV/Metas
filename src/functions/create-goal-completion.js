"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoalCompletion = createGoalCompletion;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const dayjs_1 = __importDefault(require("dayjs"));
// Criar meta concluída. 
async function createGoalCompletion({ goalId, }) {
    // Pega o primeiro dia da semana
    const firstDayOfWeek = (0, dayjs_1.default)().startOf('week').toDate();
    // Pega o último dia da semana
    const lastDayOfWeek = (0, dayjs_1.default)().endOf('week').toDate();
    // Contar quantas vezes a meta foi concluída. 
    const goalCompletionCounts = db_1.db.$with('goal_completion_counts').as(db_1.db
        .select({
        goalId: schema_1.goalCompletions.goalId,
        // Conta o número de linhas( Número de metas completadas ).
        completionCount: (0, drizzle_orm_1.count)(schema_1.goalCompletions.id).as('completionCount'),
    })
        .from(schema_1.goalCompletions)
        // Condições.
        .where((0, drizzle_orm_1.and)(
    // Maior ou igual ao primeiro dia da semana
    (0, drizzle_orm_1.gte)(schema_1.goalCompletions.createdAt, firstDayOfWeek), 
    // Menor ou igual ao último dia da semana
    (0, drizzle_orm_1.lte)(schema_1.goalCompletions.createdAt, lastDayOfWeek), 
    // Seleciona pelo goalId.
    (0, drizzle_orm_1.eq)(schema_1.goalCompletions.goalId, goalId)))
        // Agrupa os resultados.
        .groupBy(schema_1.goalCompletions.goalId));
    // Pegando o resultado da consulta anterior, combinando os valores das metas concluidas, com a frequência semanal da tabela goals. 
    const result = await db_1.db
        .with(goalCompletionCounts)
        .select({
        desiredWeeklyFrequency: schema_1.goals.desiredWeeklyFrequency,
        // COALESCE garante que o valor sempre será um número. Sem resultado retorna 0. 
        completionCount: (0, drizzle_orm_1.sql /*sql*/) `
        COALESCE(${goalCompletionCounts.completionCount}, 0)
      `
            // Converte o valor para um número.
            .mapWith(Number),
    })
        .from(schema_1.goals)
        // Cria uma junção à esquerda entre as tabelas, onde goalId for igual ao id. 
        .leftJoin(goalCompletionCounts, (0, drizzle_orm_1.eq)(goalCompletionCounts.goalId, schema_1.goals.id))
        // Condição para selecionar quando id for igual a goalId.
        .where((0, drizzle_orm_1.eq)(schema_1.goals.id, goalId))
        // Retorna apenas 1 resultado.
        .limit(1);
    // Pega os dois valores, usando desestruturação. 
    const { completionCount, desiredWeeklyFrequency } = result[0];
    if (completionCount >= desiredWeeklyFrequency) {
        throw new Error('Goal already completed this week!');
    }
    // Insere uma nova meta concluída.
    const insertResult = await db_1.db
        .insert(schema_1.goalCompletions)
        .values({ goalId })
        // Retorna os dados inseridos.
        .returning();
    const goalCompletion = insertResult[0];
    return {
        goalCompletion,
    };
}
