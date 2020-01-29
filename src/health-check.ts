export enum HealthStatus {
    UNHEALTHY = 0,
    HEALTHY = 1
}

type HealthCheck<T> = T & Record<string, HealthStatus> & { healthStatus: HealthStatus };

export const createHealthCheck: <T extends Record<string, HealthStatus>>(monitoredServices: T) => HealthCheck<T> = <T>(monitoredServices: T) => {
    const monitoredObject: HealthCheck<T> = {...monitoredServices, healthStatus: HealthStatus.UNHEALTHY};
    const handler = {
        get: (obj: HealthCheck<T>, prop: string) => {
            if (prop === 'healthStatus') {
                return Object.keys(obj).filter(key => key !== 'healthStatus').map(key => obj[key]).reduce<boolean>((a: boolean, b: HealthStatus) => b && a, true);
            } else {
                return obj[prop];
            }
        }
    };
    return new Proxy<HealthCheck<T>>(monitoredObject, handler);
};
