import { Component, Input, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { ChartConfiguration } from 'chart.js';
import { registerables } from 'chart.js';
import { ChartItem } from 'chart.js';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css'
})
export class LineChartComponent implements OnInit {
  @Input() data: any;
  @Input() labels: any;

  ngOnInit(): void {
    this.createChart()
  }

  createChart(): void {
    Chart.register(...registerables);
    const data = {
      labels: this.labels,
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: this.data
      }]
    };
    const options = {
      scales: {
        y: {
          beginAtZero: true,
          display: false
        }
      }
    }
    const config: ChartConfiguration = {
      type: 'line',
      data: data,
      options: options
    }
    const chartItem: ChartItem = document.getElementById('my-chart') as ChartItem;
    new Chart(chartItem, config);
  }
}
