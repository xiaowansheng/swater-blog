import ReactECharts from 'echarts-for-react'
import { ChartData, TrendData } from '@/types'

interface BarSeries {
  name: string
  data: (ChartData | TrendData)[]
  color?: string
}

interface BarChartProps {
  data?: ChartData[] | TrendData[]
  seriesList?: BarSeries[]
}

const DEFAULT_COLORS = ['#1890ff', '#fa8c16', '#52c41a', '#eb2f96']

const BarChart: React.FC<BarChartProps> = ({ data = [], seriesList }) => {
  const buildSingleSeries = () => {
    const isChartData = (item: ChartData | TrendData): item is ChartData => {
      return 'name' in item
    }
    const xAxisData = data.map((item) => (isChartData(item) ? item.name : item.date))
    const seriesData = data.map((item) => item.value)
    return { xAxisData, series: [{ name: '数据', data: seriesData, color: DEFAULT_COLORS[0] }] }
  }

  const buildMultiSeries = () => {
    const xAxisSet = new Set<string>()
    seriesList?.forEach((series) => {
      series.data.forEach((item) => {
        const key = 'name' in item ? item.name : item.date
        xAxisSet.add(key)
      })
    })
    const xAxisData = Array.from(xAxisSet).sort()
    const series = seriesList?.map((series, idx) => {
      const color = series.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
      const map: Record<string, number> = {}
      series.data.forEach((item) => {
        const key = 'name' in item ? item.name : item.date
        map[key] = item.value
      })
      const values = xAxisData.map((key) => map[key] || 0)
      return {
        name: series.name,
        data: values,
        type: 'bar' as const,
        barGap: '30%',
        barWidth: seriesList.length > 1 ? '25%' : '40%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color,
        },
      }
    })
    return { xAxisData, series: series || [] }
  }

  const { xAxisData, series } = seriesList && seriesList.length > 0 ? buildMultiSeries() : buildSingleSeries()

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
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(24, 144, 255, 0.1)',
        },
      },
    },
    legend: series.length > 1 ? { top: 0 } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: series.length > 1 ? '18%' : '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: '#e8e8e8',
        },
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
        rotate: xAxisData.length > 7 ? 45 : 0,
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
    series,
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

export default BarChart
