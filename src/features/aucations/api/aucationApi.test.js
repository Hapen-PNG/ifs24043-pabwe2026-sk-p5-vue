import * as api from './aucationApi.js'
import { requestJson } from '../../../helpers/apiHelper.js'

vi.mock('../../../helpers/apiHelper.js', () => ({ requestJson: vi.fn() }))

describe('aucationApi', () => {
  beforeEach(() => requestJson.mockClear())

  it('builds the list url with and without filters', () => {
    api.getAucations()
    api.getAucations({ is_me: true, is_closed: false })
    expect(requestJson.mock.calls[0][0]).toBe('/aucations')
    expect(requestJson.mock.calls[1][0]).toBe('/aucations?is_me=1&is_closed=0')
  })

  it('calls every other endpoint', () => {
    api.getAucation(1); api.addAucation({ a: 1 }); api.changeAucation(1, { a: 2 }); api.changeCover(1, new File(['x'], 'c.png'))
    api.deleteAucation(1); api.deleteAucations(); api.addBid(1, { bid: 5 }); api.deleteBid(1)
    expect(requestJson.mock.calls.map((c) => [c[0], c[1]?.method])).toEqual([
      ['/aucations/1', undefined], ['/aucations', 'POST'], ['/aucations/1', 'PUT'], ['/aucations/1/cover', 'POST'],
      ['/aucations/1', 'DELETE'], ['/aucations', 'DELETE'], ['/aucations/1/bids', 'POST'], ['/aucations/1/bids', 'DELETE'],
    ])
    expect(requestJson.mock.calls[3][1].body).toBeInstanceOf(FormData)
  })
})
