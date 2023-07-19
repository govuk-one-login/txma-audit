import { sumFunc } from '../utils/helpers'

test('adds 1 + 2 to equal 3', () => {
  const answer = sumFunc(1, 2)
  expect(answer).toEqual(3)
})
