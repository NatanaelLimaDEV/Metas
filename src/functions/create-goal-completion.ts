import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

// Define o formato esperado do objeto.
interface CreateGoalCompletionRequest {
  goalId: string
}

// Criar meta concluída. 
export async function createGoalCompletion({
  goalId,
}: CreateGoalCompletionRequest) {
  // Pega o primeiro dia da semana
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  // Pega o último dia da semana
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  // Contar quantas vezes a meta foi concluída. 
  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        // Conta o número de linhas( Número de metas completadas ).
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      // Condições.
      .where(
        and(
          // Maior ou igual ao primeiro dia da semana
          gte(goalCompletions.createdAt, firstDayOfWeek),
          // Menor ou igual ao último dia da semana
          lte(goalCompletions.createdAt, lastDayOfWeek),
          // Seleciona pelo goalId.
          eq(goalCompletions.goalId, goalId)
        )
      )
      // Agrupa os resultados.
      .groupBy(goalCompletions.goalId)
  )

  // Pegando o resultado da consulta anterior, combinando os valores das metas concluidas, com a frequência semanal da tabela goals. 
  const result = await db
    .with(goalCompletionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      // COALESCE garante que o valor sempre será um número. Sem resultado retorna 0. 
      completionCount: sql /*sql*/`
        COALESCE(${goalCompletionCounts.completionCount}, 0)
      `
      // Converte o valor para um número.
      .mapWith(Number),
    })
    .from(goals)
    // Cria uma junção à esquerda entre as tabelas, onde goalId for igual ao id. 
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goals.id))
    // Condição para selecionar quando id for igual a goalId.
    .where(eq(goals.id, goalId))
    // Retorna apenas 1 resultado.
    .limit(1)

  // Pega os dois valores, usando desestruturação. 
  const { completionCount, desiredWeeklyFrequency } = result[0]

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error('Goal already completed this week!')
  }

  // Insere uma nova meta concluída.
  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    // Retorna os dados inseridos.
    .returning()

  const goalCompletion = insertResult[0]

  return {
    goalCompletion,
  }
}
