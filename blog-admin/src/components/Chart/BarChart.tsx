import ReactECharts from 'echarts-for-react'
import { ChartData, TrendData } from '@/types'

interface BarChartProps {
  data: ChartData[] | TrendData[]
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  // 判断数据类型
  const isChartData = (item: ChartData | TrendData): item is ChartData => {
    return 'name' in item
  }

  const xAxisData = data.map((item) => (isChartData(item) ? item.name : item.date))
  const seriesData = data.map((item) => item.value)

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
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
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
    series: [
      {
        data: seriesData,
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#69c0ff' },
            ],
          },
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#096dd9' },
                { offset: 1, color: '#1890ff' },
              ],
            },
          },
        },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: '300px' }} />
}

export default BarChart
