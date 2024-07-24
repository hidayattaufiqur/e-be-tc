import client from 'prom-client';

const metrics = new client.Registry();

metrics.setDefaultLabels({ app: 'book-api' });

// this enables default metrics as per https://prometheus.io/docs/instrumenting/writing_clientlibs/#standard-and-runtime-collectors
client.collectDefaultMetrics({ register: metrics }); 

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'http_version']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'http_version'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5]
});

const errorCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status_code', 'http_version']
});

const concurrentUsersGauge = new client.Gauge({
  name: 'concurrent_users',
  help: 'Number of concurrent users',
});

metrics.registerMetric(httpRequestCounter);
metrics.registerMetric(httpRequestDuration);
metrics.registerMetric(errorCounter);

const requestMetricsMiddleware = (req, res, next) => {
  concurrentUsersGauge.inc();
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const statusCode = res.statusCode;
    const route = req.path;
    const method = req.method;
    const http_version = req.headers['x-protocol'] || req.httpVersion;
    httpRequestCounter.inc({ method, route, status_code: statusCode, http_version: http_version });
    end({ method, route, status_code: statusCode, http_version: http_version });

    if (statusCode >= 400) {
      errorCounter.inc({ method, route, status_code: statusCode, http_version });
    };
    concurrentUsersGauge.dec();
  });
  next();
};

export { metrics as metricsRegistry, requestMetricsMiddleware };
