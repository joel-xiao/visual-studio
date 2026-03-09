import { http } from '../http';

export const dataCenterApi = {
    /**
     * Get all registered data sources
     */
    getSources() {
        return http.get('/data-center/sources');
    },

    /**
     * Test a data source configuration (Server-side execution)
     * This handles cascading requests, authentications, etc.
     */
    testSource(config: any) {
        return http.post('/data-center/test', config);
    },

    /**
     * Save a data source configuration
     */
    saveSource(config: any) {
        return http.post('/data-center/save', config);
    }
};
