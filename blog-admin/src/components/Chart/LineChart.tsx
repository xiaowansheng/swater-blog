import ReactECharts from 'echarts-for-react'
import { TrendData } from '@/types'

interface LineChartProps {
  data: TrendData[]
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
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
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.date),
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#e8e8e8',
        },
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
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
        data: data.map((item) => item.value),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#722ed1' },
            ],
          },
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 2,
            borderColor: '#fff',
            shadowBlur: 10,
            shadowColor: 'rgba(24, 144, 255, 0.5)',
          },
        },
      },
    ],
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
