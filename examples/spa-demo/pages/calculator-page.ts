import S from 's-js'
import { c, h } from '../lib'
import { State } from '../state'

export const initCalculator = () => ({
  initial: S.data(200000),
  monthly: S.data(15000),
  salary_rate: S.data(2),
  inflation_rate: S.data(3),
  profit_rate: S.data(7),
  year: S.data(12),
})
export type Calculator = ReturnType<typeof initCalculator>

const space = `<div class="space"></div>`

function renderInput(o: {
  label: string
  name: keyof Calculator
  calculator: Calculator
  prefix?: string
  suffix?: string
}) {
  const value: number = o.calculator[o.name]()
  return `
<div class="input">
<label>${o.label}</label>
<div class="box">
  ${space}
  ${o.prefix ? `<span>${o.prefix}</span>` + space : ''}
  <input type="number" value="${value}" oninput="send('calculator', '${
    o.name
  }', this.valueAsNumber)">
  ${o.suffix ? space + `<span>${o.suffix}</span>` : ''}
  ${space}
</div>
</div>
`
}

// FIXME use tailwind css to improve the layout
export function renderCalculator(state: State) {
  const years: string[] = []
  const calculator = state.calculator

  const initialCapital = calculator.initial()
  const inflationRate = calculator.inflation_rate()
  const profitRate = calculator.profit_rate()
  const salaryGrowthRate = calculator.salary_rate()
  let previousMonthlyInput = calculator.monthly()
  let previousYearRevenue = 0

  for (let year = 0; year < calculator.year(); year++) {
    const inflationProduct = Math.pow(1 + inflationRate / 100, year)
    const profitProduct = 1 + profitRate / 100
    const salaryProduct = 1 + salaryGrowthRate / 100

    const inflatedMonthlyInput = previousMonthlyInput * salaryProduct

    const yearlyInput = inflatedMonthlyInput * 12

    const revenue = (() => {
      if (year === 0) {
        return (
          (initialCapital + previousYearRevenue + yearlyInput) * profitProduct
        )
      }
      return (previousYearRevenue + yearlyInput) * profitProduct
    })()

    const yearlyProfit = revenue - previousYearRevenue
    const deflatedYearlyProfit = yearlyProfit / inflationProduct
    const deflatedRevenue = revenue / inflationProduct

    years.push(`<div class="card">
<p>Year ${year + 1}</p>

<p>
Investment and profit: $${revenue.toLocaleString()}
<br>
(Eq to today's $${deflatedRevenue.toLocaleString()})
</p>

<p>
Yearly profit: $${yearlyProfit.toLocaleString()}
<br>
(Eq to today's $${deflatedYearlyProfit.toLocaleString()})
</p>

<p>
Monthly input: $${inflatedMonthlyInput.toLocaleString()}
<br>
Yearly input: $${yearlyInput.toLocaleString()}
</p>

<p></p>
</div>`)

    previousMonthlyInput = inflatedMonthlyInput
    previousYearRevenue = revenue
  }
  return c(
    '#calculator',
    h`<div id="calculator">
<style>
#calculator .header {
  background: #3f51b5;
  padding: 1em;
  color: white;
  font-weight: bold;
}
#calculator .content {
  background: #212121;
  padding: 1em;
  color: white;
}
#calculator .footer {
  background: #585858;
  padding: 0.5em;
  color: white;
}
#calculator .input {
  background: rgba(255, 255, 255, 0.09);
  display: inline-flex;
  flex-direction: column;
  margin: 4px 2px;
  border-radius: 0.35em;
  border-bottom: 1px lightgray solid;
}
#calculator .input label {
  padding-top: 0.5em;
  padding-left: 0.5em;
}
#calculator .input .box {
  display: inline-flex;
}
#calculator .input .space {
  padding: 0.25em;
}
#calculator .input input {
  background: #353535;
  color: #fff;
  border: 0;
}
table.input-table tr {
  display: inline-block;
}
#calculator .card {
  background: #424242;
  box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12);
  margin: 4px;
  display: inline-block;
  padding: 0.5em;
  padding-bottom: 1em;
}
</style>
<div class="header">Financial Freedom Calculator</div>
<div class="content">
${renderInput({
  prefix: '$',
  label: 'Initial capital',
  name: 'initial',
  calculator,
})}
${renderInput({
  prefix: '$',
  label: 'Monthly spendable funds',
  name: 'monthly',
  calculator,
})}
${renderInput({
  suffix: '%',
  label: 'Salary growth rate',
  name: 'salary_rate',
  calculator,
})}
${renderInput({
  suffix: '%',
  label: 'Inflation rate',
  name: 'inflation_rate',
  calculator,
})}
${renderInput({
  suffix: '%',
  label: 'Investment profit rate',
  name: 'profit_rate',
  calculator,
})}
${renderInput({
  suffix: 'yr',
  label: 'Calculation period',
  name: 'year',
  calculator,
})}
<div>
${years.join('')}
</div>
</div>
<div class="footer">
mock of: https://chongsaulo.github.io/financial-freedom/
</div>
</div>`,
  )
}
