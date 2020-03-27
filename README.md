# 自动根据日报生成周报（周总结）

## 使用

- 1.`npm install` 安装依赖
- 2.在 `config.json` 填写配置
- 3.`npm start` 开始生成

## 配置

```json
{
  "dailyPath": "./daily", // 日报的路径
  "nameRules": "(?<name>[\\W]*)\\s(?<date>(?<year>\\d{4})-(?<month>\\d{1,2})-(?<day>\\d{1,2}))", // 日报的命名规则
  "summary": { // 周报配置
    "outputEnable": true, // 是否输出周报到文件
    "showInCMD": true, // 是否输出周报到命令行
    "outputDir": "./week", // 输出路径
    "outputName": "{{ _nameRules.name }}{{ 周总结 }}{{ }}{{ _date.from.replace(/-/g, '.') }}{{-}}{{ _date.to.replace(/-/g, '.') }}", // 输出文件命名规则，{{}} 中可使用 js 变量
    "outputExt": [".xlsx", ".txt", ".json"],  // 输出文件类型
    "title": "{{ _nameRules.date }} {{ _sheet.project }}", // 周报汇总日报的小标题，{{}} 中可使用 js 变量
    "content": "{{ _sheet.content }}",  // 周报汇总日报的内容，{{}} 中可使用 js 变量
    "weekday": 5,  // 周报要汇总日报的数量
    "from": "{{ 2020-03-27 }}" // 周报要汇总日报要开始的日期， 设置 {{ _date.from }} 为当前日期开始，或者也可以设置从具体某一天开始
  },
  "sheet": {  // 日报内容设置
    "project": [1, 0], // 日报项目所在的单元格，第一个为行，第二个为列，行列都是从 0 开始计算
    "content": [1, 1]  // 日报工作内容所在的单元格，第一个为行，第二个为列，，行列都是从 0 开始计算
  }
}
```