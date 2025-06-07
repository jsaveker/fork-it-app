import { jest } from '@jest/globals'

describe('searchNearbyRestaurants', () => {
  const filters = { minRating: 1, maxDistance: 1000, minPrice: 1, maxPrice: 4 }
  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
    delete (global as any).fetch
    delete process.env.VITE_API_URL
  })

  it('builds the expected request', async () => {
    process.env.VITE_API_URL = 'https://example.com'
    const mockJson = jest.fn<() => Promise<{ results: any[] }>>()
    mockJson.mockResolvedValue({ results: [] })
    const mockResponse = { ok: true, json: mockJson }
    const fetchMock = jest.fn<(url: string, init?: any) => Promise<any>>()
    fetchMock.mockResolvedValue(mockResponse as any)
    ;(global as any).fetch = fetchMock

    const { searchNearbyRestaurants } = await import('../googlePlacesApi')

    await searchNearbyRestaurants({ latitude: 1, longitude: 2, radius: 3, filters })

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/places/nearby', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: 1, longitude: 2, radius: 3, filters })
    })
  })

  it('throws when the API returns an error', async () => {
    process.env.VITE_API_URL = 'https://example.com'
    const mockResponse = { ok: false, json: jest.fn() }
    ;(global as any).fetch = jest.fn<(url: string, init?: any) => Promise<any>>()
      .mockResolvedValue(mockResponse as any)

    const { searchNearbyRestaurants } = await import('../googlePlacesApi')

    await expect(
      searchNearbyRestaurants({ latitude: 1, longitude: 2, radius: 3, filters })
    ).rejects.toThrow('Failed to fetch restaurants')
  })
})
