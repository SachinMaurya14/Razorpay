import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { AgentMetricTimePoint } from '../../types';
import { Clock, Zap, Activity } from 'lucide-react';

interface AgentResponseTimeD3ChartProps {
  data: AgentMetricTimePoint[];
  selectedAgentId?: string; // 'all' | 'detection' | 'investigation' | 'resolution'
  height?: number;
}

interface TooltipData {
  x: number;
  y: number;
  point: AgentMetricTimePoint;
}

const AGENT_COLORS: Record<string, { stroke: string; dotFill: string; name: string }> = {
  detection: {
    stroke: '#06b6d4', // cyan-500
    dotFill: '#0891b2',
    name: 'Detection Agent',
  },
  investigation: {
    stroke: '#6366f1', // indigo-500
    dotFill: '#4f46e5',
    name: 'Investigation Agent',
  },
  resolution: {
    stroke: '#f59e0b', // amber-500
    dotFill: '#d97706',
    name: 'Resolution Agent',
  },
};

export const AgentResponseTimeD3Chart: React.FC<AgentResponseTimeD3ChartProps> = ({
  data,
  selectedAgentId = 'all',
  height = 320,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 600, height });

  // Handle responsive resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height,
          });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [height]);

  // Render D3 Latency Chart
  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 28, right: 32, bottom: 44, left: 52 };
    const innerWidth = Math.max(dimensions.width - margin.left - margin.right, 100);
    const innerHeight = Math.max(dimensions.height - margin.top - margin.bottom, 100);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const agentIds = selectedAgentId === 'all' 
      ? ['detection', 'investigation', 'resolution']
      : [selectedAgentId];

    // X Scale
    const timeExtent = d3.extent(sortedData, d => new Date(d.timestamp).getTime());
    const xScale = d3
      .scaleTime()
      .domain([timeExtent[0] || Date.now() - 3600000, timeExtent[1] || Date.now()])
      .range([0, innerWidth]);

    // Y Scale: 0ms to 450ms or dynamic max
    const maxLatency = d3.max(sortedData, d => d.responseTimeMs) || 350;
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(400, Math.ceil(maxLatency / 50) * 50)])
      .range([innerHeight, 0])
      .nice();

    // Horizontal Grid lines
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yScale.ticks(6))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#f1f5f9')
      .attr('stroke-dasharray', '3 3')
      .attr('stroke-width', 1);

    // P95 Reference Line (350ms)
    const p95Y = yScale(350);
    if (p95Y >= 0 && p95Y <= innerHeight) {
      const p95Group = g.append('g').attr('class', 'ref-p95');
      p95Group
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', p95Y)
        .attr('y2', p95Y)
        .attr('stroke', '#f97316')
        .attr('stroke-dasharray', '4 4')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.8);

      p95Group
        .append('text')
        .attr('x', innerWidth - 6)
        .attr('y', p95Y - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#ea580c')
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '600')
        .text('P95 Limit: 350ms');
    }

    // P50 Median Reference Line (160ms)
    const p50Y = yScale(160);
    if (p50Y >= 0 && p50Y <= innerHeight) {
      const p50Group = g.append('g').attr('class', 'ref-p50');
      p50Group
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', p50Y)
        .attr('y2', p50Y)
        .attr('stroke', '#94a3b8')
        .attr('stroke-dasharray', '3 3')
        .attr('stroke-width', 1.2)
        .attr('opacity', 0.7);

      p50Group
        .append('text')
        .attr('x', 6)
        .attr('y', p50Y - 6)
        .attr('text-anchor', 'start')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '500')
        .text('P50 Median: 160ms');
    }

    // Line generator
    const lineGenerator = d3
      .line<AgentMetricTimePoint>()
      .x(d => xScale(new Date(d.timestamp).getTime()))
      .y(d => yScale(d.responseTimeMs))
      .curve(d3.curveMonotoneX);

    // Render Series per agent
    agentIds.forEach((id) => {
      const agentSeries = sortedData.filter(d => d.agentId === id);
      if (agentSeries.length === 0) return;

      const conf = AGENT_COLORS[id] || { stroke: '#64748b', dotFill: '#475569', name: id };

      // Render Line
      g.append('path')
        .datum(agentSeries)
        .attr('fill', 'none')
        .attr('stroke', conf.stroke)
        .attr('stroke-width', selectedAgentId === id ? 3 : 2.2)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', lineGenerator);

      // Render Dots
      g.selectAll(`.dot-lat-${id}`)
        .data(agentSeries)
        .enter()
        .append('circle')
        .attr('class', `dot-lat-${id}`)
        .attr('cx', d => xScale(new Date(d.timestamp).getTime()))
        .attr('cy', d => yScale(d.responseTimeMs))
        .attr('r', selectedAgentId === id ? 4 : 3)
        .attr('fill', '#ffffff')
        .attr('stroke', conf.stroke)
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          const [x, y] = d3.pointer(event, svgRef.current);
          setTooltip({ x, y, point: d });
        });
    });

    // X Axis
    const xAxis = d3
      .axisBottom<Date>(xScale)
      .ticks(Math.max(4, Math.floor(innerWidth / 110)))
      .tickFormat(d => d3.timeFormat('%H:%M')(d as Date))
      .tickSizeOuter(0);

    const xAxisG = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisG.select('.domain').attr('stroke', '#cbd5e1');
    xAxisG.selectAll('.tick line').attr('stroke', '#e2e8f0');
    xAxisG.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '11px');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => `${d}ms`)
      .tickSizeOuter(0);

    const yAxisG = g.append('g').call(yAxis);
    yAxisG.select('.domain').attr('stroke', '#cbd5e1');
    yAxisG.selectAll('.tick line').attr('stroke', '#f1f5f9');
    yAxisG.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '11px');

    // Interactive Hover Overlay
    const focusLine = g
      .append('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 3')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .style('opacity', 0);

    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event);
      const hoveredTime = xScale.invert(mouseX).getTime();

      let closestPoint: AgentMetricTimePoint | null = null;
      let minDiff = Infinity;

      const candidates = sortedData.filter(d => 
        selectedAgentId === 'all' ? true : d.agentId === selectedAgentId
      );

      for (const d of candidates) {
        const diff = Math.abs(new Date(d.timestamp).getTime() - hoveredTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = d;
        }
      }

      if (closestPoint) {
        const px = xScale(new Date(closestPoint.timestamp).getTime());
        focusLine.attr('x1', px).attr('x2', px).style('opacity', 1);

        const [x, y] = d3.pointer(event, containerRef.current);
        setTooltip({
          x,
          y,
          point: closestPoint,
        });
      }
    });

    overlay.on('mouseleave', () => {
      focusLine.style('opacity', 0);
      setTooltip(null);
    });

  }, [data, selectedAgentId, dimensions]);

  return (
    <div ref={containerRef} className="relative w-full select-none">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible block"
      />

      {/* Hover Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-30 transition-all duration-75"
          style={{
            left: `${Math.min(tooltip.x + 12, dimensions.width - 240)}px`,
            top: `${Math.max(10, tooltip.y - 80)}px`,
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-xs text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs w-56 space-y-1.5 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: AGENT_COLORS[tooltip.point.agentId]?.stroke || '#38bdf8' }}
                />
                {tooltip.point.agentName}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {new Date(tooltip.point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-slate-400 text-[11px]">Response Time:</span>
              <span className="font-bold text-amber-400 font-mono text-xs">
                {tooltip.point.responseTimeMs} ms
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Success Score:</span>
              <span className="font-mono text-emerald-400 text-xs">
                {tooltip.point.successRate.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">SLA Status:</span>
              <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded font-mono ${
                tooltip.point.responseTimeMs < 200
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : tooltip.point.responseTimeMs < 350
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {tooltip.point.responseTimeMs < 200 ? 'Optimal' : tooltip.point.responseTimeMs < 350 ? 'Acceptable' : 'Degraded'}
              </span>
            </div>

            <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800 line-clamp-2 leading-tight">
              {tooltip.point.scenarioName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
