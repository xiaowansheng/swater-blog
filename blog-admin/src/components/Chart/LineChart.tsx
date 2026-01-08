import ReactECharts from 'echarts-for-react'
import { TrendData } from '@/types'

interface LineChartSeries {
  name: string
  data: TrendData[]
  color?: string
}

interface LineChartProps {
  data?: TrendData[]
  seriesList?: LineChartSeries[]
}

const DEFAULT_COLORS = ['#1890ff', '#ff7875', '#52c41a', '#722ed1']

const LineChart: React.FC<LineChartProps> = ({ data = [], seriesList }) => {
  const buildSingle = () => {
    return [
      {
        name: '数据',
        data,
        color: DEFAULT_COLORS[0],
      },
    ]
  }

  const seriesCfg = (seriesList && seriesList.length > 0 ? seriesList : buildSingle()).map((series, idx) => {
    const color = series.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
    return {
      name: series.name,
      data: series.data.map((d) => [d.date, d.value]),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: false,
      lineStyle: {
        width: 3,
        color,
      },
      areaStyle: {
        color,
        opacity: 0.08,
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          borderWidth: 2,
          borderColor: '#fff',
          shadowBlur: 10,
          shadowColor: color,
        },
      },
    }
  })

  const xAxisData = Array.from(
    new Set(
      (seriesList && seriesList.length > 0 ? seriesList : buildSingle())
        .flatMap((s) => s.data.map((d) => d.date))
    )
  ).sort()

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#1890ff',
          type: 'dashed',
        },
      },
    },
    legend: seriesCfg.length > 1 ? { top: 0 } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: seriesCfg.length > 1 ? '18%' : '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#e8e8e8',
        },
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
        rotate: xAxisData.length > 10 ? 45 : 0,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
      },
    },
    series: seriesCfg,
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '300px' }}
      notMerge={true}
      lazyUpdate={true}
    />
  )
}

export default LineChart
