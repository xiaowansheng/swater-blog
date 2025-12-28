import ReactECharts from 'echarts-for-react'
import { ChartData } from '@/types'

interface PieChartProps {
  data: ChartData[]
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const colors = [
    '#1890ff',
    '#52c41a',
    '#722ed1',
    '#fa8c16',
    '#eb2f96',
    '#13c2c2',
    '#faad14',
    '#2f54eb',
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 12,
      textStyle: {
        color: '#666',
        fontSize: 12,
      },
    },
    color: colors,
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index % colors.length],
          },
        })),
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

export default PieChart
