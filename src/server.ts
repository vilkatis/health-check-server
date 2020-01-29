import * as net from 'net';
import { Socket } from 'net';
import { createLogger, LogCreator, LogLevel } from './logger';
import { createHealthCheck, HealthStatus } from './health-check';

interface IDeps<T> {
    logCreator: LogCreator,
    logLevel: LogLevel,
    monitoredServices: T
}

type BuildHealthCheckServer = <T extends Record<string, HealthStatus>>(deps: IDeps<T>) => HealthCheckServer;
type HealthCheckServer = (tcpPort: number) => any;

export const buildHealthCheckServer: BuildHealthCheckServer = ({logCreator, logLevel = LogLevel.INFO, monitoredServices}) => {
    const logger = createLogger({logLevel, logCreator}).namespace('HealthCheckServer');

    const healthCheck = createHealthCheck(monitoredServices);

    return function healthCheckServer(tcpPort) {
        const server = net.createServer();
        server.listen(tcpPort);
        server.on('listening', () => logger.info('Server listening', {tcpPort}));
        server.on('close', () => logger.info('Server connection closed', {tcpPort}));
        server.on('error', err => logger.error('Server error', {errorMessage: err.message}));
        server.on('connection', handleConnection);

        function handleConnection(socket: Socket) {
            logger.info('Socket invoked - start', {});
            socket.on('end', () => {
                logger.info('Socket invoked - end', {});
            });
            socket.on('error', err => logger.error('Socket error', {errorMessage: err.message}));
            socket.write(Number(healthCheck.healthStatus).toString(10));
            socket.pipe(socket);
        }
    }
};
