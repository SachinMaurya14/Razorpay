import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { AgentMetricTimePoint } from '../../types';
import { ShieldCheck, Target, Sparkles } from 'lucide-react';

interface AgentSuccessRateD3ChartProps {
  data: AgentMetricTimePoint[];
  selectedAgentId?: string; // 'all' | 'detection' | 'investigation' | 'resolution'
  height?: number;
}

interface TooltipData {
  x: number;
  y: number;
  point: AgentMetricTimePoint;
}

const AGENT_COLORS: Record<string, { stroke: string; gradientStart: string; gradientStop: string; name: string }> = {
  detection: {
    stroke: '#06b6d4', // cyan-500
    gradientStart: 'rgba(6, 182, 212, 0.25)',
    gradientStop: 'rgba(6, 182, 212, 0.00)',
    name: 'Detection Agent',
  },
  investigation: {
    stroke: '#6366f1', // indigo-500
    gradientStart: 'rgba(99, 102, 241, 0.25)',
    gradientStop: 'rgba(99, 102, 241, 0.00)',
    name: 'Investigation Agent',
  },
  resolution: {
    stroke: '#f59e0b', // amber-500
    gradientStart: 'rgba(245, 158, 11, 0.25)',
    gradientStop: 'rgba(245, 158, 11, 0.00)',
    name: 'Resolution Agent',
  },
};

export const AgentSuccessRateD3Chart: React.FC<AgentSuccessRateD3ChartProps> = ({
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

  // Render D3 Chart
  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const margin = { top: 28, right: 32, bottom: 44, left: 48 };
    const innerWidth = Math.max(dimensions.width - margin.left - margin.right, 100);
    const innerHeight = Math.max(dimensions.height - margin.top - margin.bottom, 100);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define gradients for areas
    const defs = svg.append('defs');
    Object.entries(AGENT_COLORS).forEach(([id, conf]) => {
      const gradient = defs
        .append('linearGradient')
        .attr('id', `grad-success-${id}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop').attr('offset', '0%').attr('stop-color', conf.gradientStart);
      gradient.append('stop').attr('offset', '100%').attr('stop-color', conf.gradientStop);
    });

    // Parse dates and prepare data series
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const agentIds = selectedAgentId === 'all' 
      ? ['detection', 'investigation', 'resolution']
      : [selectedAgentId];

    // X Scale: Time scale
    const timeExtent = d3.extent(sortedData, d => new Date(d.timestamp).getTime());
    const xScale = d3
      .scaleTime()
      .domain([timeExtent[0] || Date.now() - 3600000, timeExtent[1] || Date.now()])
      .range([0, innerWidth]);

    // Y Scale: Success rate 0 to 100%
    const yScale = d3
      .scaleLinear()
      .domain([85, 100]) // Focused zoom on payment operations precision
      .range([innerHeight, 0])
      .nice();

    // Horizontal Grid lines
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#f1f5f9')
      .attr('stroke-dasharray', '3 3')
      .attr('stroke-width', 1);

    // 95% SLA Target Benchmark Reference Line
    const targetY = yScale(95);
    if (targetY >= 0 && targetY <= innerHeight) {
      const benchmarkLine = g.append('g').attr('class', 'benchmark-sla');
      benchmarkLine
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', targetY)
        .attr('y2', targetY)
        .attr('stroke', '#10b981')
        .attr('stroke-dasharray', '4 4')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.85);

      benchmarkLine
        .append('text')
        .attr('x', innerWidth - 6)
        .attr('y', targetY - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#059669')
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '600')
        .text('95.0% Target SLA Benchmark');
    }

    // Line and Area generators
    const lineGenerator = d3
      .line<AgentMetricTimePoint>()
      .x(d => xScale(new Date(d.timestamp).getTime()))
      .y(d => yScale(d.successRate))
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3
      .area<AgentMetricTimePoint>()
      .x(d => xScale(new Date(d.timestamp).getTime()))
      .y0(innerHeight)
      .y1(d => yScale(d.successRate))
      .curve(d3.curveMonotoneX);

    // Render series per agent
    agentIds.forEach((id) => {
      const agentSeries = sortedData.filter(d => d.agentId === id);
      if (agentSeries.length === 0) return;

      const conf = AGENT_COLORS[id] || { stroke: '#64748b', gradientStart: '#f8fafc', name: id };

      // Render Area (only if single agent selected or subtle for all)
      if (selectedAgentId !== 'all' || agentIds.length === 1) {
        g.append('path')
          .datum(agentSeries)
          .attr('fill', `url(#grad-success-${id})`)
          .attr('d', areaGenerator);
      }

      // Render Line
      g.append('path')
        .datum(agentSeries)
        .attr('fill', 'none')
        .attr('stroke', conf.stroke)
        .attr('stroke-width', selectedAgentId === id ? 3 : 2.2)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', lineGenerator);

      // Render Data Dots
      g.selectAll(`.dot-${id}`)
        .data(agentSeries)
        .enter()
        .append('circle')
        .attr('class', `dot-${id}`)
        .attr('cx', d => xScale(new Date(d.timestamp).getTime()))
        .attr('cy', d => yScale(d.successRate))
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
    xAxisG.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '11px').attr('font-family', 'sans-serif');

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`)
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

      // Find nearest point
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

        const py = yScale(closestPoint.successRate);
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

      {/* Interactive Tooltip Card */}
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
              <span className="text-slate-400 text-[11px]">Success Rate:</span>
              <span className="font-bold text-emerald-400 font-mono text-xs">
                {tooltip.point.successRate.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Response Time:</span>
              <span className="font-mono text-slate-200 text-xs">
                {tooltip.point.responseTimeMs} ms
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Confidence:</span>
              <span className="font-mono text-cyan-300 text-xs">
                {(tooltip.point.confidence * 100).toFixed(0)}%
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
