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

  // 批量美化图表（保留用于向后兼容，但主要逻辑在 process 中）
  const _handleBatchBeautification = async (
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

        // 检查是否已有数据
        const hasData = (currentOptions.dataset?.source?.length > 0) ||
          (Array.isArray(currentOptions.series) && currentOptions.series.some((s: any) => s.data?.length > 0));

        const dataInstruction = hasData
          ? '注意：图表已有数据，请保留原始数据，只优化样式和配置项。'
          : '注意：图表目前没有数据，请生成一段符合业务场景的 Mock 数据（放在 dataset 或 series 中）。';

        await processAgentWithAI(
          { defaultModel, schema, onStream: undefined },
          schema.prompts.beautify(node.component),
          `${dataInstruction}\nMake this ${node.name} look professional: ${JSON.stringify(currentOptions || {})}`,
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

    // 场景1: 工作流中，前一个 agent（如 layout-architect）创建了节点，需要依次更新这些图表节点
    const previousNodes = context?.previousAgentData?.nodes;
    if (previousNodes?.length) {
      // 过滤出图表节点
      const chartNodes = previousNodes.filter(isChartNode);
      if (chartNodes.length > 0) {
        // 依次更新每个图表节点
        const chartOptions: Record<string, unknown> = {};

        for (const node of chartNodes) {
          if (onStream) {
            onStream({
              content: getSchemaMessage(schema, 'beautifying', node.name),
              type: 'text'
            });
          }

          try {
            const optionsRaw = node.props?.code?.options;
            const currentOptions = safeParseJSON(
              typeof optionsRaw === 'string' ? optionsRaw : JSON.stringify(optionsRaw || {}),
              {}
            );

            // 检查是否已有数据
            const hasData = (currentOptions.dataset?.source?.length > 0) ||
              (Array.isArray(currentOptions.series) && currentOptions.series.some((s: any) => s.data?.length > 0));

            const dataInstruction = hasData
              ? '注意：图表已有数据，请保留原始数据，只优化样式和配置项。'
              : '注意：图表目前没有数据，请生成一段符合业务场景的 Mock 数据（放在 dataset 或 series 中）。';

            await processAgentWithAI(
              { defaultModel, schema, onStream: undefined },
              schema.prompts.beautify(node.component),
              `${dataInstruction}\n优化这个图表: ${JSON.stringify(currentOptions || {})}`,
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
      }
    }

    // 场景2: 有选中节点，更新选中图表
    const targetNode = context?.selectedNodes?.[0];
    if (targetNode) {
      return handleSingleChartRequest(input, targetNode);
    }

    // 场景3: 创建新图表
    return handleSingleChartRequest(input, undefined);
  };

  return createAgent(schema, process);
}
