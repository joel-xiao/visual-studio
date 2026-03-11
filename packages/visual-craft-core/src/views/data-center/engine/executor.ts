import { IDataSourceConfig, IRequestStep } from './types';

export class DataRequestExecutor {
    private results: Record<string, any> = {};
    private variables: Record<string, any> = {};

    constructor(private config: IDataSourceConfig) {
        // Initialize global variables
        if (config.variables) {
            config.variables.forEach(v => {
                this.variables[v.key] = v.value;
            });
        }
    }

    async execute() {
        this.results = {};
        for (const step of this.config.steps) {
            if (step.enable === false) continue;

            // 1. Check Condition
            if (step.condition) {
                const shouldExecute = this.evaluateCondition(step.condition, this.getContext());
                if (!shouldExecute) {
                    continue;
                }
            }

            const result = await this.executeStep(step);
            this.results[step.id] = result;
        }
        return { results: this.results, variables: this.variables };
    }

    private getContext() {
        // Shared context for templates and scripts
        const context: Record<string, any> = {
            results: this.results,
            variables: this.variables,
            // Shortcut access by ID
            ...this.variables
        };
        Object.entries(this.results).forEach(([id, res]) => {
            context[id] = res?.data ?? res;
        });
        return context;
    }

    private async executeStep(step: IRequestStep) {
        switch (step.type) {
            case 'sql':
                return this.executeSqlRequest(step);
            case 'redis':
                return this.executeRedisRequest(step);
            case 'mqtt':
                return this.executeMqttRequest(step);
            case 'http':
            case 'reference': // References are resolved to http steps before execution
            default:
                return this.executeHttpRequest(step as IHttpStep);
        }
    }

    private async executeHttpRequest(step: IHttpStep) {
        const context = this.getContext();
        const resolvedUrl = this.resolveTemplate(step.url, context);
        let url = resolvedUrl;
        if (this.config.baseUrl && !url.startsWith('http')) {
            url = this.config.baseUrl + url;
        }

        const headers: Record<string, string> = {};

        // 1. Apply Global Headers
        if (this.config.globalHeaders) {
            this.config.globalHeaders.forEach(h => {
                if (h.enabled) headers[h.key] = this.resolveTemplate(h.value, context);
            });
        }

        // 2. Handle Authentication (Step local or inherited)
        const auth = (step.auth?.type === 'inherit' || !step.auth) ? this.config.globalAuth : step.auth;

        if (auth && auth.type !== 'none') {
            const { type, config } = auth;
            if (type === 'bearer' && config.token) {
                headers['Authorization'] = `Bearer ${this.resolveTemplate(config.token, context)}`;
            } else if (type === 'basic' && config.username && config.password) {
                const user = this.resolveTemplate(config.username, context);
                const pass = this.resolveTemplate(config.password, context);
                headers['Authorization'] = `Basic ${btoa(user + ':' + pass)}`;
            } else if (type === 'apikey' && config.key && config.value) {
                const key = this.resolveTemplate(config.key, context);
                const val = this.resolveTemplate(config.value, context);
                if (config.addIn === 'query') {
                    const separator = url.includes('?') ? '&' : '?';
                    url += `${separator}${key}=${val}`;
                } else {
                    headers[key] = val;
                }
            }
        }

        // 3. Apply Step Local Headers (Override globals)
        if (step.headers) {
            Object.entries(step.headers).forEach(([key, val]) => {
                headers[key] = this.resolveTemplate(val, context);
            });
        }

        const options: RequestInit = {
            method: step.method,
            headers: headers
        };

        if (step.method !== 'GET' && step.body) {
            const body = typeof step.body === 'string' ? step.body : JSON.stringify(step.body);
            options.body = this.resolveTemplate(body, context);
        }

        try {
            // Mocking fetch (integration stage)
            const rawResult = { status: 200, data: { success: true, id: Math.random().toString(36).substr(2, 9) } };

            // 5. Transform Result & Update Variables
            const transformScript = step.transformation?.script;
            if (transformScript) {
                return this.transformResult(transformScript, rawResult, context);
            }

            return rawResult;
        } catch (e) {
            return { status: 500, message: String(e) };
        }
    }

    private async executeSqlRequest(step: ISqlStep) {
        // ... (existing implementation)
        return { status: 200, data: { success: true, query: step.query } };
    }

    private async executeRedisRequest(step: IRedisStep) {
        const context = this.getContext();
        const resolvedArgs: Record<string, any> = {};
        for (const key in step.args) {
            resolvedArgs[key] = this.resolveTemplate(step.args[key], context);
        }
        // Mock Redis execution
        return { status: 200, data: { success: true, command: step.command, args: resolvedArgs } };
    }

    private async executeMqttRequest(step: IMqttStep) {
        const context = this.getContext();
        const resolvedPayload = this.resolveTemplate(step.payload, context);
        // Mock MQTT execution
        return { status: 200, data: { success: true, action: step.action, topic: step.topic, payload: resolvedPayload } };
    }

    private transformResult(script: string, rawResult: any, context: Record<string, any>) {
        try {
            // In transformation, we provide a 'set' helper to update global variables
            const transformationContext = {
                ...context,
                res: rawResult,
                data: rawResult.data,
                set: (key: string, value: any) => {
                    this.variables[key] = value;
                }
            };

            const keys = Object.keys(transformationContext);
            const values = Object.values(transformationContext);
            const fn = new Function(...keys, `try { ${script} } catch(e) { return res; }`);
            const transformed = fn(...values);

            return transformed !== undefined ? transformed : rawResult;
        } catch (e) {
            console.error(`Transformation failed:`, e);
            return rawResult;
        }
    }

    private resolveTemplate(template: string, context: Record<string, any>): string {
        if (!template) return '';
        return template.replace(/\{\{(.*?)\}\}/g, (_, expression) => {
            try {
                const keys = Object.keys(context);
                const values = Object.values(context);
                const fn = new Function(...keys, `try { return ${expression.trim()}; } catch(e) { return ""; }`);
                return fn(...values) ?? "";
            } catch (e) {
                return "";
            }
        });
    }

    private evaluateCondition(condition: string, context: Record<string, any>): boolean {
        try {
            const keys = Object.keys(context);
            const values = Object.values(context);
            const fn = new Function(...keys, `return !!(${condition});`);
            return fn(...values);
        } catch (e) {
            return true;
        }
    }
}
