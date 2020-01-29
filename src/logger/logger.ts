import { createLevel, LogLevel } from './create-level';

export interface ILoggerEntryContent {
    readonly timestamp: Date;
    readonly message: string;
    [key: string]: any;
}

export interface ILogEntry {
    namespace: string;
    level: LogLevel;
    label: string;
    log: ILoggerEntryContent;
}

type LogFunction = (entry: ILogEntry) => void;
export type LogCreator = (logLevel: LogLevel) => LogFunction;

export const createLogger = ({logLevel = LogLevel.INFO, logCreator}: { logLevel: LogLevel, logCreator: LogCreator }) => {
    const logFunction = logCreator(logLevel);

    const createNamespace = (namespace: string, logLevel: LogLevel = null) => {
        return createLogFunctions(namespace, logLevel);
    };

    const createLogFunctions = (namespace?: string, namespaceLogLevel: LogLevel = null) => {
        const currentLogLevel = () => (namespaceLogLevel == null ? logLevel : namespaceLogLevel);
        const logger = {
            info: createLevel('INFO', LogLevel.INFO, currentLogLevel, namespace, logFunction),
            error: createLevel('ERROR', LogLevel.ERROR, currentLogLevel, namespace, logFunction),
            warn: createLevel('WARN', LogLevel.WARN, currentLogLevel, namespace, logFunction),
            debug: createLevel('DEBUG', LogLevel.DEBUG, currentLogLevel, namespace, logFunction),
        };

        return Object.assign(logger, {
            namespace: createNamespace,
            setLogLevel: (newLevel: LogLevel) => {
                logLevel = newLevel
            },
        });
    };

    return createLogFunctions()
};
