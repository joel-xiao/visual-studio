import type { IAgent, IAgentResponse } from '../../types';
import { useAIConfig } from '../../hooks/core/use-ai-config';
import { safeParseJSON } from '../../utils/json-utils';
import chartCreatorSchema from './schema';
import { getSchemaMessage } from '../../utils/agent/schema-helpers';
import { createAgent } from '../../utils/agent/agent-factory';
import { processAgentWithAI } from '../../utils/agent/base-agent';

/// <reference types="../../../../types/node" />

interface IWorkflowContext {
  previousAgentData?: { nodes?: INode[] };
  selectedNodes?: INode[];
  [key: string]: unknown;
}

/**
 * Chart Creator Agent
 * 简化版本：直接使用通用工具函数
 */
export function useChartCreator(): IAgent {
  const { defaultModel } = useAIConfig();
  const schema = chartCreatorSchema;

  const isChartNode = (node: INode): boolean => {
    return node?.component?.toLowerCase().includes('apache_echarts') || false;
  };

  // 批量美化图表
  const handleBatchBeautification = async (
    nodes: INode[],
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    const chartNodes = nodes.filter(isChartNode);
    const chartOptions: Record<string, unknown> = {};

    for (const node of chartNodes) {
        if (onStream) {
          onStream({ content: getSchemaMessage(schema, 'beautifying', node.name), type: 'text' });
        }

        try {
        const optionsRaw = node.props?.code?.options;
        const currentOptions = safeParseJSON(
          typeof optionsRaw === 'string' ? optionsRaw : JSON.stringify(optionsRaw || {}),
          {}
        );

        await processAgentWithAI(
          { defaultModel, schema, onStream: undefined },
          schema.prompts.beautify(node.component),
          `Make this ${node.name} look professional: ${JSON.stringify(currentOptions || {})}`,
          (result: unknown) => {
            const r = result as { data?: { options?: unknown } };
            if (r?.data?.options) {
              chartOptions[node.id] = r.data.options;
              if (onStream) {
                onStream({
                  content: getSchemaMessage(schema, 'beautified', node.name),
                  type: 'text',
                  data: { chartOptions: { [node.id]: r.data.options } }
                });
              }
              return {
                content: getSchemaMessage(schema, 'beautified', node.name),
                type: 'text',
                data: { chartOptions: { [node.id]: r.data.options } }
              };
            }
            return null;
          }
        );
      } catch (error) {
        console.error(`[ChartCreator] Failed to beautify ${node.name}:`, error);
        }
      }

      return {
        content: getSchemaMessage(schema, 'completed'),
        type: 'text',
        data: { chartOptions }
      };
  };

  // 单图表创建/更新
  const handleSingleChartRequest = async (
    input: string,
    targetNode: INode | undefined
  ): Promise<IAgentResponse> => {
    const targetContext = targetNode
      ? `\nTarget: ${JSON.stringify({ id: targetNode.id, name: targetNode.name, options: targetNode.props?.code?.options })}`
      : '';

    return processAgentWithAI(
      { defaultModel, schema, onStream: undefined },
      schema.prompts.create(targetContext),
      input,
      (result: unknown) => {
        if (!result) {
          return null;
        }
        const r = result as { data?: unknown; options?: unknown; content?: string };
        const payload = r.data || (r.options ? result : result);
        return {
          content: r.content || getSchemaMessage(schema, 'created'),
          type: 'chart',
          data: payload
        };
      }
    );
  };

  const process = async (
    input: string,
    context?: IWorkflowContext,
    onStream?: (partial: Partial<IAgentResponse>) => void
  ): Promise<IAgentResponse> => {
    if (onStream) {
      onStream({ content: getSchemaMessage(schema, 'processing'), type: 'chart' });
    }

    const previousNodes = context?.previousAgentData?.nodes;
    if (previousNodes?.length) {
      return handleBatchBeautification(previousNodes, onStream);
    }

    const targetNode = context?.selectedNodes?.[0];
    return handleSingleChartRequest(input, targetNode);
  };

  return createAgent(schema, process);
}
