import http from './http';

/**
 * Data center data structure transformation
 * Backend stores configuration in a 'config' JSON field, 
 * but frontend expects a flat object.
 */
const transformSource = (source: any) => {
    if (!source) return source;
    const { config, ...rest } = source;
    return {
        ...rest,
        ...(config || {}),
        id: source.id // Ensure ID remains at top level
    };
};

export const dataCenterApi = {
    /**
     * Get all registered data sources
     */
    async getSources() {
        const res = await http.get<any[]>('/data-center/sources');
        if (res.data && Array.isArray(res.data)) {
            res.data = res.data.map(transformSource);
        }
        return res;
    },

    /**
     * Test a data source configuration (Server-side execution)
     */
    testSource(config: any) {
        return http.post('/data-center/test', config);
    },

    /**
     * Save a data source configuration (Create or Update)
     */
    saveSource(config: any) {
        // If it has an ID, it's an update (except for the ds_ prefix used in mock/temp)
        if (config.id && !config.id.startsWith('ds_')) {
            const { id, name, type, status, categoryId, ...rest } = config;
            return http.put(`/data-center/sources/${id}`, {
                name,
                type,
                status,
                categoryId,
                config: rest
            });
        }
        
        // Create new
        const { name, type, status, categoryId, ...rest } = config;
        return http.post('/data-center/save', {
            name,
            type,
            status,
            categoryId,
            config: rest
        });
    },

    /**
     * Delete a data source
     */
    deleteSource(id: string) {
        return http.delete(`/data-center/sources/${id}`);
    }
};
