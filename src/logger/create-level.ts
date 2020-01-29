export enum LogLevel {
    NOTHING = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 4,
    DEBUG = 5,
}

export type Level = (message: string, extra: Record<string, any>) => void;
type CurrentLevel = () => LogLevel;
type CreateLevel = (label: string, level: LogLevel, currentLevel: CurrentLevel, namespace: string, logFunction: any) => Level;

export const createLevel: CreateLevel = (label, level, currentLevel, namespace, logFunction) => (message, extra = {}) => {
    if (level > currentLevel()) return;
    logFunction({
        namespace,
        level,
        label,
        log: Object.assign(
            {
                timestamp: new Date().toISOString(),
                logger: 'health-check',
                message,
            },
            extra
        ),
    });
};
