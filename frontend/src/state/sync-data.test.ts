import { expect, test } from 'vite-plus/test'
import { mergeSyncData } from './sync-data'

test('merge keeps the newest Profile and never drops absent entries', () => {
  const cloud = { profile: { at: 20, value: { age: 42 } } }
  const device = { profile: { at: 10, value: { age: 24 } } }
  expect(mergeSyncData(cloud, device)).toEqual(cloud)
  expect(mergeSyncData(cloud, {})).toEqual(cloud)
  expect(mergeSyncData(device, cloud)).toEqual(cloud)
})
