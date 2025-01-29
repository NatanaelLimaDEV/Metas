import { db } from '../db'
import { goals } from '../db/schema'

// Define o formato esperado do objeto.
interface CreateGoalRequest {
  title: string
  desiredWeeklyFrequency: number
}

// Cria uma nova meta.
export async function createGoal({
  title,
  desiredWeeklyFrequency,
}: CreateGoalRequest) {
  const result = await db
    .insert(goals)
    .values({
      title,
      desiredWeeklyFrequency,
    })
    .returning()

  const goal = result[0]

  return {
    goal,
  }
}
