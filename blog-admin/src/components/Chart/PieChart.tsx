import ReactECharts from 'echarts-for-react'

interface PieChartProps {
  data: Array<{ name: string; value: number }>
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const option = {
    tooltip: {
      trigger: 'item',
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: '300px' }} />
}

export default PieChart

