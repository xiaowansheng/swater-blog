import ReactECharts from 'echarts-for-react'

interface LineChartProps {
  data: Array<{ date: string; value: number }>
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const option = {
    xAxis: {
      type: 'category',
      data: data.map((item) => item.date),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: data.map((item) => item.value),
        type: 'line',
        smooth: true,
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
  }

  return <ReactECharts option={option} style={{ height: '300px' }} />
}

export default LineChart

