import dayjs from 'dayjs'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

// Pega as metas pendentes.
export async function getWeekPendingGoals() {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  // Pega as metas criadas até o final da semana.
  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      // lte - menor ou igual.
      .where(lte(goals.createdAt, lastDayOfWeek))
  )

  // Conta as vezes que a meta foi completada. 
  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id)
        .as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          // gte - maior ou igual.
          gte(goalCompletions.createdAt, firstDayOfWeek),
          // lte - menor ou igual.
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  // Pega as metas pendentes. 
  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionCounts)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      // COALESCE, garante que o retorno será 0 e não null.
      completionCount: sql/*sql*/`
        COALESCE(${goalCompletionCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goalsCreatedUpToWeek)
    // Junção que retorna todos os dados da esquerda.
    // eq - igual.
    .leftJoin(
      goalCompletionCounts,
      eq(goalCompletionCounts.goalId, goalsCreatedUpToWeek.id)
    )

  return { pendingGoals }
}
