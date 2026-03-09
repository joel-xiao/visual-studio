import { IDataSourceConfig, IRequestStep } from './types';

export class DataRequestExecutor {
    private results: Record<string, any> = {};

    constructor(private config: IDataSourceConfig) { }

    async execute() {
        this.results = {};
        for (const step of this.config.steps) {
            if (step.enable === false) continue;

            // 1. Check Condition
            if (step.condition) {
                const shouldExecute = this.evaluateCondition(step.condition, this.results);
                if (!shouldExecute) {
                    console.log(`Skipping ${step.name} due to condition: ${step.condition}`);
                    continue;
                }
            }

            const result = await this.executeStep(step);
            this.results[step.id] = result;
        }
        return this.results;
    }

    private async executeStep(step: IRequestStep) {
        // 2. Resolve Dynamic URLs/Params/Headers
        const resultsContext = this.results;
        const resolvedUrl = this.resolveTemplate(step.url, resultsContext);
        let url = resolvedUrl;
        if (this.config.baseUrl && !url.startsWith('http')) {
            url = this.config.baseUrl + url;
        }

        const headers = { ...this.config.globalHeaders };

        // --- Handle Authentication ---
        if (step.auth && step.auth.type !== 'none') {
            const { type, config } = step.auth;
            if (type === 'bearer' && config.token) {
                const token = this.resolveTemplate(config.token, resultsContext);
                headers['Authorization'] = `Bearer ${token}`;
            } else if (type === 'basic' && config.username && config.password) {
                const user = this.resolveTemplate(config.username, resultsContext);
                const pass = this.resolveTemplate(config.password, resultsContext);
                headers['Authorization'] = `Basic ${btoa(user + ':' + pass)}`;
            } else if (type === 'apikey' && config.key && config.value) {
                const key = this.resolveTemplate(config.key, resultsContext);
                const val = this.resolveTemplate(config.value, resultsContext);
                if (config.addIn === 'query') {
                    const separator = url.includes('?') ? '&' : '?';
                    url += `${separator}${key}=${val}`;
                } else {
                    headers[key] = val;
                }
            }
        }

        if (step.headers) {
            Object.entries(step.headers).forEach(([key, val]) => {
                headers[key] = this.resolveTemplate(val, resultsContext);
            });
        }

        // 3. Construct Fetch Options
        const options: RequestInit = {
            method: step.method,
            headers: headers
        };

        if (step.method !== 'GET' && step.body) {
            const body = typeof step.body === 'string' ? step.body : JSON.stringify(step.body);
            options.body = this.resolveTemplate(body, this.results);
        }

        // 4. Actual Fetch
        try {
            console.log(`Executing ${step.name}: ${step.method} ${url}`, { resultsContext: this.results });
            // Mocking fetch for now (integration stage)
            const rawResult = { status: 200, data: { example: 'result_of_' + step.id, timestamp: Date.now() } };

            // 5. Transform Result if script exists
            if (step.transformResponse) {
                return this.transformResult(step.transformResponse, rawResult, resultsContext);
            }

            return rawResult;
        } catch (e) {
            return { status: 500, message: String(e) };
        }
    }

    private transformResult(script: string, rawResult: any, results: Record<string, any>) {
        try {
            const context: Record<string, any> = { results, res: rawResult, data: rawResult.data };
            Object.entries(results).forEach(([id, res]) => {
                context[id] = res?.data ?? res;
            });

            const keys = Object.keys(context);
            const values = Object.values(context);
            const fn = new Function(...keys, `try { ${script} } catch(e) { return res; }`);
            const transformed = fn(...values);

            // If function returns nothing, return raw
            return transformed !== undefined ? transformed : rawResult;
        } catch (e) {
            console.error(`Transformation failed for step:`, e);
            return rawResult;
        }
    }

    private resolveTemplate(template: string, results: Record<string, any>): string {
        if (!template) return '';

        // Build a friendly context where each step is accessible by its ID directly
        // e.g. results = { login: { data: { token: '...' } } } 
        // -> context will have 'login' property pointing to results.login.data
        const context: Record<string, any> = { results };
        Object.entries(results).forEach(([id, res]) => {
            context[id] = res?.data ?? res;
        });

        return template.replace(/\{\{(.*?)\}\}/g, (_, expression) => {
            try {
                // Use keys of context as arguments to the Function
                const keys = Object.keys(context);
                const values = Object.values(context);
                const fn = new Function(...keys, `try { return ${expression.trim()}; } catch(e) { return ""; }`);
                return fn(...values) ?? "";
            } catch (e) {
                console.warn(`Template resolve failed for expression: ${expression}`, e);
                return "";
            }
        });
    }

    private evaluateCondition(condition: string, results: Record<string, any>): boolean {
        try {
            const context: Record<string, any> = { results };
            Object.entries(results).forEach(([id, res]) => {
                context[id] = res?.data ?? res;
            });

            const keys = Object.keys(context);
            const values = Object.values(context);
            const fn = new Function(...keys, `return !!(${condition});`);
            return fn(...values);
        } catch (e) {
            console.error(`Condition evaluation failed: ${condition}`, e);
            return true; // Run by default if error
        }
    }
}
