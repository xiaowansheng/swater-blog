import ReactECharts from 'echarts-for-react'

interface BarChartProps {
  data: Array<{ name: string; value: number }>
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const option = {
    xAxis: {
      type: 'category',
      data: data.map((item) => item.name),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: data.map((item) => item.value),
        type: 'bar',
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
  }

  return <ReactECharts option={option} style={{ height: '300px' }} />
}

export default BarChart

