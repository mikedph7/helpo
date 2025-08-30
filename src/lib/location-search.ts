// Location search utilities for the Helpo platform

export interface LocationSearchResult {
  serviceIds: number[];
  matchType: 'service_coverage' | 'provider_coverage' | 'provider_location';
}

export interface CityInfo {
  id: number;
  name: string;
  region: string;
  province?: string;
}

/**
 * Search for services by location
 * Priority order:
 * 1. Service-specific coverage cities
 * 2. Provider's default coverage cities  
 * 3. Provider's location field (fallback)
 */
export async function searchServicesByLocation(
  location: string,
  prisma: any
): Promise<LocationSearchResult> {
  try {
    // First, find matching cities
    const matchingCities = await prisma.city.findMany({
      where: {
        name: {
          contains: location,
          mode: 'insensitive'
        }
      },
      take: 10
    });

    const cityIds = matchingCities.map((city: any) => city.id);
    const serviceIds: number[] = [];
    let matchType: LocationSearchResult['matchType'] = 'provider_location';

    if (cityIds.length > 0) {
      // 1. Services with specific coverage
      const servicesWithCoverage = await prisma.service.findMany({
        where: {
          coverage_cities: {
            some: {
              city_id: {
                in: cityIds
              }
            }
          }
        },
        select: { id: true }
      });

      if (servicesWithCoverage.length > 0) {
        serviceIds.push(...servicesWithCoverage.map((s: any) => s.id));
        matchType = 'service_coverage';
      }

      // 2. Services inheriting provider coverage (no specific service coverage)
      const servicesWithProviderCoverage = await prisma.service.findMany({
        where: {
          AND: [
            {
              coverage_cities: {
                none: {}
              }
            },
            {
              provider: {
                coverage_cities: {
                  some: {
                    city_id: {
                      in: cityIds
                    }
                  }
                }
              }
            }
          ]
        },
        select: { id: true }
      });

      if (servicesWithProviderCoverage.length > 0) {
        serviceIds.push(...servicesWithProviderCoverage.map((s: any) => s.id));
        if (matchType !== 'service_coverage') {
          matchType = 'provider_coverage';
        }
      }
    }

    // 3. Fallback to provider location field
    if (serviceIds.length === 0) {
      const servicesWithLocationMatch = await prisma.service.findMany({
        where: {
          provider: {
            location: {
              contains: location,
              mode: 'insensitive'
            }
          }
        },
        select: { id: true }
      });

      serviceIds.push(...servicesWithLocationMatch.map((s: any) => s.id));
    }

    return {
      serviceIds: [...new Set(serviceIds)], // Remove duplicates
      matchType
    };
  } catch (error) {
    console.error('Error in location search:', error);
    return {
      serviceIds: [],
      matchType: 'provider_location'
    };
  }
}

/**
 * Get coverage cities for a service
 * Returns service-specific coverage or provider's default coverage
 */
export async function getServiceCoverage(
  serviceId: number,
  prisma: any
): Promise<CityInfo[]> {
  try {
    // First check if service has specific coverage
    const serviceCoverage = await prisma.serviceCoverage.findMany({
      where: { service_id: serviceId },
      include: { city: true }
    });

    if (serviceCoverage.length > 0) {
      return serviceCoverage.map((sc: any) => ({
        id: sc.city.id,
        name: sc.city.name,
        region: sc.city.region,
        province: sc.city.province
      }));
    }

    // Fall back to provider's default coverage
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: {
          include: {
            coverage_cities: {
              include: { city: true }
            }
          }
        }
      }
    });

    if (service?.provider?.coverage_cities) {
      return service.provider.coverage_cities.map((pc: any) => ({
        id: pc.city.id,
        name: pc.city.name,
        region: pc.city.region,
        province: pc.city.province
      }));
    }

    return [];
  } catch (error) {
    console.error('Error getting service coverage:', error);
    return [];
  }
}
